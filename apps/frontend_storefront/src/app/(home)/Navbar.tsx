"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Search,
    ShoppingCart,
    Bell,
    MessageSquare,
    User,
    Menu,
    SlidersHorizontal,
    FilterIcon
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from 'next/dynamic';
import { useMediaQuery } from 'usehooks-ts'
import { useGetIdentity, useLogout } from "@refinedev/core";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useFilterStore } from "@/store/filter-store";
import { useCartStore } from "@/store/cart-store";

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: userData } = useGetIdentity();
    const { mutate } = useLogout();
    
    // Filter store
    const { 
        category, 
        priceRange, 
        rating, 
        sortBy, 
        isFilterMenuOpen, 
        setCategory, 
        setPriceRange, 
        setRating, 
        setSortBy, 
        toggleFilterMenu 
    } = useFilterStore();
    
    // Cart store
    const { totalItems } = useCartStore();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement search functionality
        console.log("Searching for:", searchQuery);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 px-4 py-3 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center mx-auto max-w-7xl">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center no-underline">
                            <Image
                                src="/logo.png"
                                alt="Hope World"
                                width={40}
                                height={40}
                                className="mr-2"
                            />
                            <span className="hidden text-xl font-bold md:inline-block">Hope World</span>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                    )}

                    {/* Search Bar - Desktop */}
                    <div className={`hidden flex-1 mx-4 max-w-xl md:block`}>
                        <div className="flex items-center">
                            <form onSubmit={handleSearch} className="relative flex-1">
                                <Input
                                    type="text"
                                    placeholder="Search for products..."
                                    className="py-2 pr-4 pl-10 rounded-full border-gray-300 border-1 focus:border-gray-400 focus:ring-0"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                            </form>
                            <Button
                                variant="outline"
                                size="icon"
                                className="ml-2"
                                onClick={toggleFilterMenu}
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Icons - Desktop */}
                    <div className="hidden items-center space-x-2 md:flex">
                        <Button variant="ghost" size="icon" asChild className="relative">
                            <Link href="/cart">
                                <ShoppingCart className="w-5 h-5" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/avatar.png" alt="User" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Link href="/profile" className="flex w-full">Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/order-history" className="flex w-full">Orders</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Link href="/settings" className="flex w-full">Settings</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => mutate()}>Logout</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Filter Menu - Updated with shadcn components */}
                {isFilterMenuOpen && (
                    <div className="hidden py-3 mt-2 border-t border-gray-200 duration-300 md:block animate-in slide-in-from-top">
                        <div className="flex flex-wrap justify-between items-center mx-auto max-w-7xl">
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center">
                                    <span className="mr-2 text-sm font-medium">Category:</span>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="w-[140px] h-8 text-sm">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="clothing">Clothing</SelectItem>
                                            <SelectItem value="home">Home & Garden</SelectItem>
                                            <SelectItem value="books">Books</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator orientation="vertical" className="h-8" />

                                <div className="flex items-center">
                                    <span className="mr-2 text-sm font-medium">Price:</span>
                                    <Select value={priceRange} onValueChange={setPriceRange}>
                                        <SelectTrigger className="w-[140px] h-8 text-sm">
                                            <SelectValue placeholder="All Prices" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Prices</SelectItem>
                                            <SelectItem value="under25">Under $25</SelectItem>
                                            <SelectItem value="25-50">$25 - $50</SelectItem>
                                            <SelectItem value="50-100">$50 - $100</SelectItem>
                                            <SelectItem value="over100">$100+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator orientation="vertical" className="h-8" />

                                <div className="flex items-center">
                                    <span className="mr-2 text-sm font-medium">Rating:</span>
                                    <Select value={rating} onValueChange={setRating}>
                                        <SelectTrigger className="w-[140px] h-8 text-sm">
                                            <SelectValue placeholder="Any Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any Rating</SelectItem>
                                            <SelectItem value="4plus">4★ & Up</SelectItem>
                                            <SelectItem value="3plus">3★ & Up</SelectItem>
                                            <SelectItem value="2plus">2★ & Up</SelectItem>
                                            <SelectItem value="1plus">1★ & Up</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex items-center mt-2 md:mt-0">
                                <span className="mr-2 text-sm font-medium">Sort By:</span>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[160px] h-8 text-sm">
                                        <SelectValue placeholder="Relevance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="relevance">Relevance</SelectItem>
                                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                        <SelectItem value="rating">Customer Rating</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mobile Menu & Search */}
            {isMobile && mobileMenuOpen && (
                <div className="pb-2 mt-3 md:hidden">
                    <form onSubmit={handleSearch} className="relative mb-3">
                        <Input
                            type="text"
                            placeholder="Search for products..."
                            className="py-2 pr-4 pl-10 rounded-full border-2 border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-1 top-1/2 bg-transparent rounded-full border-none transform -translate-y-1/2"
                            onClick={toggleFilterMenu}
                        >
                            <FilterIcon className="w-5 h-5 bg-none" />
                        </Button>
                    </form>

                    {/* Mobile Filter Menu */}
                    {isFilterMenuOpen && (
                        <div className="p-3 mb-4 bg-gray-50 rounded-lg duration-300 animate-in fade-in">
                            <div className="grid grid-cols-1 gap-3">
                                <div>
                                    <span className="text-sm font-medium">Category:</span>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="mt-1 w-full h-8 text-sm">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            <SelectItem value="electronics">Electronics</SelectItem>
                                            <SelectItem value="clothing">Clothing</SelectItem>
                                            <SelectItem value="home">Home & Garden</SelectItem>
                                            <SelectItem value="books">Books</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <span className="text-sm font-medium">Price:</span>
                                    <Select value={priceRange} onValueChange={setPriceRange}>
                                        <SelectTrigger className="mt-1 w-full h-8 text-sm">
                                            <SelectValue placeholder="All Prices" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Prices</SelectItem>
                                            <SelectItem value="under25">Under $25</SelectItem>
                                            <SelectItem value="25-50">$25 - $50</SelectItem>
                                            <SelectItem value="50-100">$50 - $100</SelectItem>
                                            <SelectItem value="over100">$100+</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <span className="text-sm font-medium">Rating:</span>
                                    <Select value={rating} onValueChange={setRating}>
                                        <SelectTrigger className="mt-1 w-full h-8 text-sm">
                                            <SelectValue placeholder="Any Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="any">Any Rating</SelectItem>
                                            <SelectItem value="4plus">4★ & Up</SelectItem>
                                            <SelectItem value="3plus">3★ & Up</SelectItem>
                                            <SelectItem value="2plus">2★ & Up</SelectItem>
                                            <SelectItem value="1plus">1★ & Up</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <span className="text-sm font-medium">Sort By:</span>
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="mt-1 w-full h-8 text-sm">
                                            <SelectValue placeholder="Relevance" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="relevance">Relevance</SelectItem>
                                            <SelectItem value="price-asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price-desc">Price: High to Low</SelectItem>
                                            <SelectItem value="newest">Newest First</SelectItem>
                                            <SelectItem value="rating">Customer Rating</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-around">
                        <Link href="/cart" className="flex flex-col items-center relative">
                            <ShoppingCart className="mb-1 w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {totalItems}
                                </span>
                            )}
                            <span className="text-xs">Cart</span>
                        </Link>
                        <Link href="/notifications" className="flex flex-col items-center">
                            <Bell className="mb-1 w-5 h-5" />
                            <span className="text-xs">Alerts</span>
                        </Link>
                        <Link href="/messages" className="flex flex-col items-center">
                            <MessageSquare className="mb-1 w-5 h-5" />
                            <span className="text-xs">Messages</span>
                        </Link>
                        <Link href="/profile" className="flex flex-col items-center">
                            <User className="mb-1 w-5 h-5" />
                            <span className="text-xs">Profile</span>
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;