import { useStorage } from "@/context/StorageContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Truck, Package, MapPin, ChevronDown, ChevronUp } from "lucide-react";

const Tracking = () => {
    const { user } = useAuth();
    const { orders, fetchOrders } = useStorage();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    // Helper to determine step status
    const getStepStatus = (stepTitle: string, currentStatus: string) => {
        const statusOrder = ["Order Confirmed", "Fabric Pickup", "In Stitching", "Dispatched", "Delivered"];

        const normalize = (s: string) => {
            if (s === "Out for Delivery") return "Dispatched";
            return s;
        };

        const currentIdx = statusOrder.indexOf(normalize(currentStatus));
        const stepIdx = statusOrder.indexOf(stepTitle);

        if (stepIdx < currentIdx) return "completed";
        if (stepIdx === currentIdx) return "active";
        return "pending";
    };

    const allSteps = [
        { title: "Order Confirmed", statusMatch: "Order Confirmed", icon: CheckCircle2 },
        { title: "Fabric Pickup", statusMatch: "Fabric Pickup", icon: MapPin },
        { title: "In Stitching", statusMatch: "In Stitching", icon: Clock },
        { title: "Dispatched", statusMatch: "Dispatched", icon: Package },
        { title: "Delivered", statusMatch: "Delivered", icon: Truck },
    ];

    const OrderTimeline = ({ order }: { order: any }) => (
        <div className="space-y-8 relative z-10 mt-6 md:pl-4">
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-white/10 z-0" />
            {allSteps.map((step, idx) => {
                const Icon = step.icon;
                const status = getStepStatus(step.statusMatch, order.status);
                const isActive = status === "active";
                const isCompleted = status === "completed";
                const isPending = status === "pending";

                let iconColor = "text-muted-foreground";
                let bgColor = "bg-surface-elevated";
                let borderColor = "border-white/10";

                // Dynamic Date
                let dateDisplay = "";
                if (step.title === "Order Confirmed") {
                    dateDisplay = new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                } else if (step.title === "Delivered") {
                    dateDisplay = `Est: ${new Date(order.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                } else if (isActive) {
                    dateDisplay = "In Progress";
                }

                if (isCompleted) {
                    iconColor = "text-green-500";
                    bgColor = "bg-green-500/10";
                    borderColor = "border-green-500/50";
                } else if (isActive) {
                    iconColor = "text-accent";
                    bgColor = "bg-accent/10";
                    borderColor = "border-accent/50";
                }

                return (
                    <div key={idx} className="flex gap-4 md:gap-6 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${borderColor} ${bgColor} flex-shrink-0 z-10 bg-background`}>
                            <Icon className={`w-4 h-4 ${iconColor}`} />
                        </div>
                        <div className="pb-2">
                            <h3 className={`font-medium text-lg leading-none ${isPending ? 'text-muted-foreground' : 'text-foreground'}`}>{step.title}</h3>
                            <p className="text-xs text-muted-foreground/60 mt-1">{dateDisplay}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const latestOrder = orders.length > 0 ? orders[0] : null;
    const pastOrders = orders.length > 1 ? orders.slice(1) : [];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 py-12 px-6">
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Active Order Section */}
                    {latestOrder ? (
                        <section>
                            <h1 className="font-serif text-3xl font-bold mb-6">Active Order Tracking</h1>
                            <Card className="bg-surface-elevated/30 border border-white/5 backdrop-blur-sm p-6 border-l-4 border-l-accent">
                                <CardHeader className="px-0 pt-0 pb-6 border-b border-white/10">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">Order #{latestOrder._id.slice(-8).toUpperCase()}</CardTitle>
                                                <span className="px-2 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium">
                                                    {latestOrder.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">Placed on {new Date(latestOrder.createdAt).toLocaleDateString()} • {latestOrder.items.length} Items</p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                            <p className="text-2xl font-serif">₹{latestOrder.totalAmount}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0 pt-6">
                                    <OrderTimeline order={latestOrder} />
                                </CardContent>
                            </Card>
                        </section>
                    ) : (
                        <div className="text-center py-16 bg-surface-elevated/30 rounded-xl border border-white/5">
                            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                            <h2 className="text-xl font-medium">No Orders Yet</h2>
                            <p className="text-muted-foreground mt-2">Your fashion journey begins with your first order.</p>
                        </div>
                    )}

                    {/* Order History Section */}
                    {pastOrders.length > 0 && (
                        <section>
                            <h2 className="font-serif text-2xl font-bold mb-6">Order History</h2>
                            <div className="grid gap-4">
                                {pastOrders.map((order) => (
                                    <Card key={order._id} className="bg-surface-elevated/20 border border-white/5 hover:border-white/10 transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                                        <Package className="w-5 h-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount} • {order.items.length} Items
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                                >
                                                    {expandedOrderId === order._id ? "Hide Status" : "Track"}
                                                    {expandedOrderId === order._id ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
                                                </Button>
                                            </div>

                                            {expandedOrderId === order._id && (
                                                <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-sm font-medium">Status: <span className={order.status === 'Delivered' ? 'text-green-500' : 'text-accent'}>{order.status}</span></span>
                                                    </div>
                                                    <OrderTimeline order={order} />
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Tracking;
