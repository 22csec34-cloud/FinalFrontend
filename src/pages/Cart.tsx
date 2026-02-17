
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useStorage } from "@/context/StorageContext";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, createOrder } = useStorage();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showSizeModal, setShowSizeModal] = useState(false);
    const [measurements, setMeasurements] = useState({
        chest: "",
        waist: "",
        hips: "",
        shoulder: "",
        length: "",
        additionalNotes: ""
    });

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? 50 : 0; // Flat shipping rate
    const total = subtotal + shipping;

    const handleCheckoutClick = () => {
        setShowSizeModal(true);
    };

    const handleConfirmOrder = async () => {
        setIsCheckingOut(true);
        // Basic validation: ensure at least one measurement is provided or notes
        if (!measurements.chest && !measurements.waist && !measurements.additionalNotes) {
            // Optional: you can enforce strict fields here
        }

        const success = await createOrder(cartItems, total, measurements);
        setIsCheckingOut(false);
        setShowSizeModal(false);
        if (success) {
            navigate("/tracking");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setMeasurements(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="font-serif text-3xl font-bold mb-8 flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8" />
                        Your Shopping Cart
                    </h1>

                    {cartItems.length === 0 ? (
                        <div className="text-center py-20 bg-surface-elevated/30 rounded-2xl border border-white/5">
                            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                            <p className="text-muted-foreground mb-6">Looks like you haven't added any designs yet.</p>
                            <Link to="/gallery">
                                <Button>Browse Gallery</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items List */}
                            <div className="lg:col-span-2 space-y-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 bg-surface-elevated/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
                                        <div className="w-full sm:w-32 h-32 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                            <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
                                        </div>

                                        <div className="flex-1 text-center sm:text-left">
                                            <h3 className="font-medium text-lg">{item.label}</h3>
                                            <p className="text-sm text-muted-foreground mb-2">Custom Design</p>
                                            <p className="font-semibold text-accent">₹{item.price}</p>
                                        </div>

                                        <div className="flex items-center gap-4 bg-background/50 rounded-lg p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, -1)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        <div className="flex flex-col items-end gap-2">
                                            <span className="font-bold text-lg">₹{item.price * item.quantity}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" /> Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <Card className="p-6 bg-surface-elevated/50 backdrop-blur-md border-white/10 sticky top-24">
                                    <h2 className="text-xl font-serif font-semibold mb-6">Order Summary</h2>

                                    <div className="space-y-4 mb-6">
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                                            <span>₹{subtotal}</span>
                                        </div>
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Shipping</span>
                                            <span>₹{shipping}</span>
                                        </div>
                                        <div className="h-px bg-white/10 my-4" />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-accent">₹{total}</span>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-12 text-lg bg-foreground text-background hover:bg-foreground/90"
                                        onClick={handleCheckoutClick}
                                        disabled={isCheckingOut}
                                    >
                                        {isCheckingOut ? "Processing..." : "Checkout"} <ArrowRight className="ml-2 w-5 h-5" />
                                    </Button>

                                    <p className="text-xs text-center text-muted-foreground mt-4">
                                        Secure Checkout with Razorpay/Stripe (Demo)
                                    </p>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={showSizeModal} onOpenChange={setShowSizeModal}>
                <DialogContent className="sm:max-w-[500px] bg-background border-white/10">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-serif">Enter Your Measurements</DialogTitle>
                        <DialogDescription>
                            Please provide your manual size details for a perfect custom fit.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="chest">Chest (in)</Label>
                                <Input
                                    id="chest"
                                    name="chest"
                                    placeholder="e.g. 38"
                                    value={measurements.chest}
                                    onChange={handleInputChange}
                                    className="bg-surface-elevated/50 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="waist">Waist (in)</Label>
                                <Input
                                    id="waist"
                                    name="waist"
                                    placeholder="e.g. 32"
                                    value={measurements.waist}
                                    onChange={handleInputChange}
                                    className="bg-surface-elevated/50 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="hips">Hips (in)</Label>
                                <Input
                                    id="hips"
                                    name="hips"
                                    placeholder="e.g. 40"
                                    value={measurements.hips}
                                    onChange={handleInputChange}
                                    className="bg-surface-elevated/50 border-white/10"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="shoulder">Shoulder (in)</Label>
                                <Input
                                    id="shoulder"
                                    name="shoulder"
                                    placeholder="e.g. 18"
                                    value={measurements.shoulder}
                                    onChange={handleInputChange}
                                    className="bg-surface-elevated/50 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="length">Prefered Length (in)</Label>
                            <Input
                                id="length"
                                name="length"
                                placeholder="e.g. 42 (Shoulder to hem)"
                                value={measurements.length}
                                onChange={handleInputChange}
                                className="bg-surface-elevated/50 border-white/10"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="additionalNotes">Additional Notes</Label>
                            <Input
                                id="additionalNotes"
                                name="additionalNotes"
                                placeholder="Any specific fit preferences..."
                                value={measurements.additionalNotes}
                                onChange={handleInputChange}
                                className="bg-surface-elevated/50 border-white/10"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSizeModal(false)}>Cancel</Button>
                        <Button onClick={handleConfirmOrder} disabled={isCheckingOut} className="bg-gradient-gold text-white">
                            {isCheckingOut ? "Placing Order..." : "Confirm & Place Order"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Footer />
        </div>
    );
};

export default Cart;
