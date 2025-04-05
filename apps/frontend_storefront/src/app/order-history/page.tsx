'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Package2, Search, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'

// Mock order data
const mockOrders = [
    {
        id: 'HW1001', date: '2023-07-15', status: 'Delivered', items: [
            { name: 'Eco-friendly Water Bottle', quantity: 2 },
            { name: 'Organic Cotton T-shirt', quantity: 1 }
        ]
    },
    {
        id: 'HW1002', date: '2023-07-20', status: 'In Transit', items: [
            { name: 'Solar-powered Charger', quantity: 1 },
            { name: 'Recycled Paper Notebook', quantity: 3 }
        ]
    },
    {
        id: 'HW1003', date: '2023-07-25', status: 'Processing', items: [
            { name: 'Bamboo Toothbrush Set', quantity: 2 },
            { name: 'Reusable Produce Bags', quantity: 1 }
        ]
    },
]

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Delivered':
            return <CheckCircle className="w-5 h-5 text-green-500" />
        case 'In Transit':
            return <Truck className="w-5 h-5 text-blue-500" />
        case 'Processing':
            return <Clock className="w-5 h-5 text-yellow-500" />
        default:
            return <AlertCircle className="w-5 h-5 text-red-500" />
    }
}

export default function Component() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null)

    const filteredOrders = mockOrders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-background">
            <header className="shadow-md bg-card">
                <div className="container flex justify-between items-center px-4 py-6 mx-auto">
                    <div className="flex items-center space-x-2">
                        <Package2 className="w-6 h-6 text-primary" />
                        <span className="text-2xl font-bold text-primary">Hope World</span>
                    </div>
                    <nav>
                        <Button variant="ghost">Home</Button>
                        <Button variant="ghost">Shop</Button>
                        <Button variant="ghost">Account</Button>
                    </nav>
                </div>
            </header>

            <main className="container px-4 py-8 mx-auto">
                <h1 className="mb-6 text-3xl font-bold">Order Tracking</h1>

                <div className="mb-6">
                    <Label htmlFor="order-search">Search for your order</Label>
                    <div className="relative mt-1">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="order-search"
                            type="search"
                            placeholder="Enter your order number..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredOrders.length > 0 ? (
                                <ul className="space-y-4">
                                    {filteredOrders.map(order => (
                                        <li key={order.id}>
                                            <Button
                                                variant="outline"
                                                className="justify-start w-full text-left"
                                                onClick={() => setSelectedOrder(order)}
                                            >
                                                <div className="flex justify-between items-center w-full">
                                                    <div>
                                                        <p className="font-semibold">Order {order.id}</p>
                                                        <p className="text-sm text-muted-foreground">{order.date}</p>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {getStatusIcon(order.status)}
                                                        <span className="ml-2">{order.status}</span>
                                                    </div>
                                                </div>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground">No orders found</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedOrder ? (
                                <div>
                                    <p className="mb-2 font-semibold">Order {selectedOrder.id}</p>
                                    <p className="mb-2">Date: {selectedOrder.date}</p>
                                    <p className="mb-4">Status: {selectedOrder.status}</p>
                                    <h3 className="mb-2 font-semibold">Items:</h3>
                                    <ul className="list-disc list-inside">
                                        {selectedOrder.items.map((item, index) => (
                                            <li key={index}>
                                                {item.name} (Quantity: {item.quantity})
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">Select an order to view details</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>

            <footer className="py-8 mt-12 bg-card">
                <div className="container flex flex-col justify-between items-center px-4 mx-auto md:flex-row">
                    <div className="mb-4 md:mb-0">
                        <span className="text-lg font-semibold">© 2023 Hope World. All rights reserved.</span>
                    </div>
                    <div className="flex space-x-4">
                        <Button variant="link">About Us</Button>
                        <Button variant="link">Contact</Button>
                        <Button variant="link">Privacy Policy</Button>
                        <Button variant="link">Terms of Service</Button>
                    </div>
                </div>
            </footer>
        </div>
    )
}