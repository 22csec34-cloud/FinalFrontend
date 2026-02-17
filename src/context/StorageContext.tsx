import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

export interface GeneratedImage {
    id: string;
    label: string;
    description: string;
    url: string | null;
    date?: string;
    viewType?: string;
}

export interface CartItem {
    id: string;
    label: string;
    image: string;
    price: number;
    quantity: number;
}

interface StorageContextType {
    savedImages: GeneratedImage[];
    cartItems: CartItem[];
    addToGallery: (image: GeneratedImage) => void;
    saveImageSet: (images: GeneratedImage[], description: string) => Promise<void>;
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, delta: number) => void;
    refreshGallery: () => void;
    deleteImageSet: (setId: string) => Promise<void>;
    createOrder: (items: CartItem[], totalAmount: number, sizeDetails?: any) => Promise<boolean>;
    orders: any[];
    fetchOrders: () => void;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [savedImages, setSavedImages] = useState<GeneratedImage[]>([]);
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem('style-weaver-cart');
        return saved ? JSON.parse(saved) : [];
    });

    const getToken = () => localStorage.getItem('token');

    const fetchGallery = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/user/image-sets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Transform image sets into flat array for display
                const allImages: GeneratedImage[] = [];
                data.forEach((set: any) => {
                    set.images.forEach((img: any, idx: number) => {
                        allImages.push({
                            id: `${set.setId || set._id}-${img.viewType}`,
                            label: img.label,
                            description: set.description || '',
                            url: img.url,
                            date: set.generatedAt || new Date().toISOString(),
                            viewType: img.viewType
                        });
                    });
                });
                setSavedImages(allImages.reverse());
            }
        } catch (error) {
            console.error("Failed to fetch gallery:", error);
        }
    };

    useEffect(() => {
        fetchGallery();
    }, []);

    const saveImageSet = async (images: GeneratedImage[], description: string) => {
        const token = getToken();
        if (!token) {
            toast.error("Please login to save images");
            return;
        }

        // Only save images that have URLs
        const validImages = images.filter(img => img.url);
        if (validImages.length === 0) return;

        try {
            const response = await fetch('http://localhost:5000/api/save-image-set', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    description,
                    images: validImages.map(img => ({
                        viewType: img.id, // using id as viewType (front, left, back, outfit)
                        url: img.url,
                        label: img.label
                    }))
                })
            });

            if (response.ok) {
                toast.success("Image set saved to Collection");
                fetchGallery(); // Refresh list
            } else {
                const err = await response.json();
                toast.error(`Failed to save: ${err.error}`);
            }
        } catch (error) {
            console.error("Storage Error:", error);
            toast.error("Network error saving image set");
        }
    };

    const addToGallery = async (image: GeneratedImage) => {
        const token = getToken();
        if (!token) {
            toast.error("Please login to save images");
            // You might want to redirect to login here
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/save-gallery-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ imageUrl: image.url, label: image.label })
            });

            if (response.ok) {
                toast.success("Design saved to Collection");
                fetchGallery(); // Refresh list
            } else {
                const err = await response.json();
                toast.error(`Failed to save: ${err.error}`);
            }
        } catch (error) {
            console.error("Storage Error:", error);
            toast.error("Network error saving image");
        }
    };

    const addToCart = (item: Omit<CartItem, 'quantity'>) => {
        setCartItems((prev) => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                toast.info("Increased quantity in cart");
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            toast.success(`Added ${item.label} to cart`);
            return [{ ...item, quantity: 1 }, ...prev];
        });
    };

    const removeFromCart = (id: string) => {
        setCartItems((prev) => prev.filter(item => item.id !== id));
        toast.success("Removed from cart");
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems((prev) => prev.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const deleteImageSet = async (setId: string) => {
        const token = getToken();
        if (!token) {
            toast.error("Please login");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/user/image-set/${setId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                toast.success("Outfit removed from gallery");
                fetchGallery(); // Refresh list to remove the deleted items
            } else {
                toast.error("Failed to delete outfit");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            toast.error("Network error deleting outfit");
        }
    };

    useEffect(() => {
        localStorage.setItem('style-weaver-cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const [orders, setOrders] = useState<any[]>([]);

    const createOrder = async (items: CartItem[], totalAmount: number, sizeDetails?: any) => {
        const token = getToken();
        if (!token) {
            toast.error("Please login to checkout");
            return false;
        }

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ items, totalAmount, measurements: sizeDetails })
            });

            if (response.ok) {
                toast.success("Order placed successfully!");
                setCartItems([]); // Clear cart
                return true;
            } else {
                const err = await response.json();
                toast.error(`Order failed: ${err.error}`);
                return false;
            }
        } catch (error) {
            console.error("Order Error:", error);
            toast.error("Network error placing order");
            return false;
        }
    };

    const fetchOrders = async () => {
        const token = getToken();
        if (!token) return;

        try {
            const response = await fetch('http://localhost:5000/api/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        }
    };

    useEffect(() => {
        fetchGallery();
        fetchOrders();
    }, []);

    return (
        <StorageContext.Provider value={{
            savedImages,
            cartItems,
            addToGallery,
            saveImageSet,
            addToCart,
            removeFromCart,
            updateQuantity,
            refreshGallery: fetchGallery,
            deleteImageSet,
            createOrder,
            orders,
            fetchOrders
        }}>
            {children}
        </StorageContext.Provider>
    );
};

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (context === undefined) {
        throw new Error('useStorage must be used within a StorageProvider');
    }
    return context;
};
