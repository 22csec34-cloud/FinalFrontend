import { useStorage } from "@/context/StorageContext";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Truck, Package, MapPin, ChevronDown, ChevronUp, Activity } from "lucide-react";

const Tracking = () => {
    const { user } = useAuth();
    const { orders, fetchOrders } = useStorage();
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [now, setNow] = useState(Date.now());

    useEffect(() => {
        fetchOrders();
    }, []);

    // Live clock tick for dynamic time display
    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Helper: human-readable time since a date
    const getTimeSince = (dateStr: string) => {
        const diff = now - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ${hrs % 24}h ago`;
    };

    // Helper: estimated time remaining to delivery
    const getTimeRemaining = (deliveryDate: string) => {
        const diff = new Date(deliveryDate).getTime() - now;
        if (diff <= 0) return "Arriving soon";
        const hrs = Math.floor(diff / 3600000);
        const days = Math.floor(hrs / 24);
        if (days > 0) return `${days}d ${hrs % 24}h remaining`;
        return `${hrs}h remaining`;
    };

    // Helper to determine step status
    const getStepStatus = (stepTitle: string, currentStatus: string) => {
        const statusOrder = ["Order Confirmed", "Fabric Pickup", "In Stitching", "Dispatched", "Delivered"];
        const normalize = (s: string) => (s === "Out for Delivery" ? "Dispatched" : s);
        const currentIdx = statusOrder.indexOf(normalize(currentStatus));
        const stepIdx = statusOrder.indexOf(stepTitle);
        if (stepIdx < currentIdx) return "completed";
        if (stepIdx === currentIdx) return "active";
        return "pending";
    };

    // Calculate progress percentage
    const getProgressPercent = (currentStatus: string) => {
        const statusOrder = ["Order Confirmed", "Fabric Pickup", "In Stitching", "Dispatched", "Delivered"];
        const normalize = (s: string) => (s === "Out for Delivery" ? "Dispatched" : s);
        const idx = statusOrder.indexOf(normalize(currentStatus));
        if (idx < 0) return 0;
        return Math.round(((idx + 1) / statusOrder.length) * 100);
    };

    const allSteps = [
        { title: "Order Confirmed", statusMatch: "Order Confirmed", icon: CheckCircle2, estDays: 0 },
        { title: "Fabric Pickup", statusMatch: "Fabric Pickup", icon: MapPin, estDays: 1 },
        { title: "In Stitching", statusMatch: "In Stitching", icon: Clock, estDays: 3 },
        { title: "Dispatched", statusMatch: "Dispatched", icon: Package, estDays: 5 },
        { title: "Delivered", statusMatch: "Delivered", icon: Truck, estDays: 7 },
    ];

    const OrderTimeline = ({ order }: { order: any }) => (
        <div className="space-y-1 relative z-10 mt-6 md:pl-4">
            {/* Vertical line with green gradient for completed portion */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-0.5 bg-white/10 z-0" />
            <div
                className="absolute left-4 md:left-8 top-0 w-0.5 z-[1] rounded-full"
                style={{
                    height: `${getProgressPercent(order.status)}%`,
                    background: 'linear-gradient(to bottom, #22c55e, #4ade80, #86efac)',
                    transition: 'height 1s ease'
                }}
            />

            {allSteps.map((step, idx) => {
                const Icon = step.icon;
                const status = getStepStatus(step.statusMatch, order.status);
                const isActive = status === "active";
                const isCompleted = status === "completed";
                const isPending = status === "pending";

                // Compute estimated date for this step based on order creation + estDays offset
                const stepDate = new Date(new Date(order.createdAt).getTime() + step.estDays * 86400000);

                let dateDisplay = "";
                let timeInfo = "";
                if (step.title === "Order Confirmed") {
                    dateDisplay = new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    if (isCompleted || isActive) {
                        timeInfo = getTimeSince(order.createdAt);
                    }
                } else if (step.title === "Delivered") {
                    dateDisplay = `Est: ${new Date(order.estimatedDelivery).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                    if (isActive) {
                        timeInfo = getTimeRemaining(order.estimatedDelivery);
                    }
                } else if (isCompleted) {
                    dateDisplay = stepDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    timeInfo = "Completed";
                } else if (isActive) {
                    dateDisplay = "In Progress";
                    timeInfo = getTimeSince(order.updatedAt || order.createdAt);
                } else {
                    dateDisplay = `Est: ${stepDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                }

                return (
                    <div key={idx} className={`flex gap-4 md:gap-6 relative py-3 rounded-lg transition-all duration-300 ${isActive ? 'bg-green-500/5 px-2 -mx-2' : ''}`}>
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 z-10 transition-all duration-500 ${isCompleted
                                ? 'border-green-500 bg-green-500/20 shadow-[0_0_12px_rgba(34,197,94,0.4)]'
                                : isActive
                                    ? 'border-green-400 bg-green-400/10 shadow-[0_0_16px_rgba(74,222,128,0.5)] animate-status-pulse'
                                    : 'border-white/10 bg-surface-elevated'
                            }`}>
                            <Icon className={`w-4 h-4 transition-colors duration-300 ${isCompleted ? 'text-green-400' : isActive ? 'text-green-300' : 'text-muted-foreground'
                                }`} />
                        </div>
                        <div className="pb-1 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-medium text-lg leading-none transition-colors ${isCompleted ? 'text-green-400' : isPending ? 'text-muted-foreground' : 'text-foreground'
                                    }`}>
                                    {step.title}
                                </h3>
                                {isActive && (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/30">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                        </span>
                                        <span className="text-[10px] font-medium text-green-400">LIVE</span>
                                    </span>
                                )}
                                {isCompleted && (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <p className="text-xs text-muted-foreground/60">{dateDisplay}</p>
                                {timeInfo && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-white/5 text-muted-foreground/50'
                                        }`}>
                                        {timeInfo}
                                    </span>
                                )}
                            </div>
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
                        <section className="animate-fade-in">
                            <div className="flex items-center gap-3 mb-6">
                                <h1 className="font-serif text-3xl font-bold">Active Order Tracking</h1>
                                {latestOrder.status !== "Delivered" && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/15 border border-green-500/25">
                                        <Activity className="w-3 h-3 text-green-400" />
                                        <span className="text-xs font-medium text-green-400">Live</span>
                                    </span>
                                )}
                            </div>
                            <Card className="bg-surface-elevated/30 border border-white/5 backdrop-blur-sm p-6 border-l-4 border-l-green-500 relative overflow-hidden">
                                {/* Green gradient glow at top */}
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-600 via-green-400 to-emerald-300" />
                                <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />

                                <CardHeader className="px-0 pt-0 pb-6 border-b border-white/10 relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">Order #{latestOrder._id.slice(-8).toUpperCase()}</CardTitle>
                                                <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
                                                    {latestOrder.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Placed on {new Date(latestOrder.createdAt).toLocaleDateString()} • {latestOrder.items.length} Items
                                            </p>
                                        </div>
                                        <div className="text-left md:text-right">
                                            <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                                            <p className="text-2xl font-serif">₹{latestOrder.totalAmount}</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="mt-5">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs text-muted-foreground">Progress</span>
                                            <span className="text-xs font-medium text-green-400">{getProgressPercent(latestOrder.status)}%</span>
                                        </div>
                                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000 ease-out relative"
                                                style={{
                                                    width: `${getProgressPercent(latestOrder.status)}%`,
                                                    background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)',
                                                }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                                            </div>
                                        </div>
                                        {latestOrder.estimatedDelivery && latestOrder.status !== "Delivered" && (
                                            <p className="text-[11px] text-green-400/70 mt-1.5">
                                                ⏱ {getTimeRemaining(latestOrder.estimatedDelivery)}
                                            </p>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="px-0 pt-6 relative z-10">
                                    <OrderTimeline order={latestOrder} />
                                </CardContent>
                            </Card>
                        </section>
                    ) : (
                        <div className="text-center py-16 bg-surface-elevated/30 rounded-xl border border-white/5 animate-fade-in">
                            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-30" />
                            <h2 className="text-xl font-medium">No Orders Yet</h2>
                            <p className="text-muted-foreground mt-2">Your fashion journey begins with your first order.</p>
                        </div>
                    )}

                    {/* Order History Section */}
                    {pastOrders.length > 0 && (
                        <section className="animate-slide-up">
                            <h2 className="font-serif text-2xl font-bold mb-6">Order History</h2>
                            <div className="grid gap-4">
                                {pastOrders.map((order) => (
                                    <Card key={order._id} className="bg-surface-elevated/20 border border-white/5 hover:border-green-500/20 transition-all duration-300">
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${order.status === 'Delivered' ? 'bg-green-500/10' : 'bg-white/5'
                                                        }`}>
                                                        {order.status === 'Delivered'
                                                            ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                                                            : <Package className="w-5 h-5 text-muted-foreground" />
                                                        }
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(order.createdAt).toLocaleDateString()} • ₹{order.totalAmount} • {order.items.length} Items
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === 'Delivered'
                                                            ? 'bg-green-500/15 text-green-400'
                                                            : 'bg-white/5 text-muted-foreground'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                                    >
                                                        {expandedOrderId === order._id ? "Hide" : "Track"}
                                                        {expandedOrderId === order._id ? <ChevronUp className="ml-2 w-4 h-4" /> : <ChevronDown className="ml-2 w-4 h-4" />}
                                                    </Button>
                                                </div>
                                            </div>

                                            {expandedOrderId === order._id && (
                                                <div className="mt-6 pt-6 border-t border-white/5 animate-fade-in">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium">
                                                            Status: <span className={order.status === 'Delivered' ? 'text-green-500' : 'text-green-400'}>{order.status}</span>
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">{getProgressPercent(order.status)}% complete</span>
                                                    </div>
                                                    {/* Mini progress bar */}
                                                    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
                                                        <div
                                                            className="h-full rounded-full"
                                                            style={{
                                                                width: `${getProgressPercent(order.status)}%`,
                                                                background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)',
                                                            }}
                                                        />
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
