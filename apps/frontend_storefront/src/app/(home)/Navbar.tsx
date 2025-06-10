"use client";

import { useEffect, useState } from "react";
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
  FilterIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from "next/dynamic";
import { useMediaQuery } from "usehooks-ts";
import {
  Authenticated,
  useGetIdentity,
  useLogout,
  useSelect,
} from "@refinedev/core";
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
import { useDebounce } from "@components/ui/multiple-selector";
import { set } from "date-fns";
import { downloadImage } from "supabase-package/utils/downloadImage";
import { supabaseBrowserClient } from "supabase-package/client";
import { UserData } from "@types";

const Navbar = ({ filter = false }: { filter?: boolean }) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { data: userData } = useGetIdentity<UserData>();
  const { mutate } = useLogout();

  // Filter store
  const {
    search,
    setSearch,
    category,
    priceRange,
    rating,
    sortByDate,
    isFilterMenuOpen,
    sortByPrice,
    setCategory,
    setPriceRange,
    setRating,
    setSortByDate,
    setSortByPrice,
    toggleFilterMenu,
  } = useFilterStore();

  // Cart store
  const { totalItems } = useCartStore();

  const { query } = useSelect({
    resource: "categories",
    optionLabel: "text", // Use the "text" field for display
    optionValue: "id", // Use the "id" field for value
    debounce: 300,
    queryOptions: {
      meta: {
        limit: 100,
      },
      enabled: filter, // Only run this query if filter is true
    },
  });

  useEffect(() => {
    // Download avatar image if user data is available
    if (userData?.avatar_url) {
      downloadImage({
        path: userData.avatar_url,
        callBackSuccess: (url) => setAvatarUrl(url),
        callBackError: () => setAvatarUrl(null),
      });
    } else {
      setAvatarUrl(null);
    }
  }, [userData?.avatar_url]);

  // Handle clearing filters
  const handleClearFilters = () => {
    setCategory("all");
    setPriceRange("all");
    setRating("any");
    setSearch("");
    setSortByDate("desc");
    setSortByPrice("desc");
  };

  console.log("Navbar userData", userData);
  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   // Implement search functionality
  //   setSearch();
  // };

  return (
    <>
      <nav className="sticky top-0 z-50 px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mx-auto max-w-7xl">
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
              <span className="hidden text-xl font-bold md:inline-block">
                Hope World
              </span>
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
          {filter && (
            <div className={`hidden flex-1 mx-4 max-w-xl md:block`}>
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search for products..."
                    className="py-2 pl-10 pr-4 border-gray-300 rounded-full border-1 focus:border-gray-400 focus:ring-0"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                </div>
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
          )}

          {/* Navigation Icons - Desktop */}
          <div className="items-center hidden space-x-2 md:flex">
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link href="/cart">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute flex items-center justify-center w-4 h-4 text-xs rounded-full -top-1 -right-1 bg-primary text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      key={avatarUrl}
                      src={avatarUrl || "/avatar.png"}
                      alt="User"
                    />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Authenticated
                  key={"auth_profile_button"}
                  fallback={
                    <DropdownMenuItem>
                      <Link href="/login" className="flex w-full">
                        Login
                      </Link>
                    </DropdownMenuItem>
                  }
                >
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/account" className="flex w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/order-history" className="flex w-full">
                      Orders
                    </Link>
                  </DropdownMenuItem>
                  {/* <DropdownMenuItem>
                    <Link href="/settings" className="flex w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => mutate()}>
                    Logout
                  </DropdownMenuItem>
                </Authenticated>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filter Menu - Updated with shadcn components */}
        {isFilterMenuOpen && filter && (
          <div className="hidden py-3 mt-2 duration-300 border-t border-gray-200 md:block animate-in slide-in-from-top">
            <div className="flex flex-wrap items-center justify-between mx-auto max-w-7xl">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <span className="mr-2 text-sm font-medium">Category:</span>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {query?.data?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.text}
                        </SelectItem>
                      ))}
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

              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <span className="mr-2 text-sm font-medium">Sort By:</span>
                <Select value={sortByDate} onValueChange={setSortByDate}>
                  <SelectTrigger className="w-[160px] h-8 text-sm">
                    <SelectValue placeholder="Relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Date: Oldest First</SelectItem>
                    <SelectItem value="desc">Date: Newest First</SelectItem>
                    {/* <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem> */}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="ml-2"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile Menu & Search */}
      {isMobile && mobileMenuOpen && filter && (
        <div className="pb-2 mt-3 md:hidden">
          {/* <form onSubmit={handleSearch} className="relative mb-3"> */}
          <div className="relative mb-3">
            <Input
              type="text"
              placeholder="Search for products..."
              className="py-2 pl-10 pr-4 border-2 border-gray-300 rounded-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            <Button
              variant="outline"
              size="icon"
              className="absolute transform -translate-y-1/2 bg-transparent border-none rounded-full right-1 top-1/2"
              onClick={toggleFilterMenu}
            >
              <FilterIcon className="w-5 h-5 bg-none" />
            </Button>
          </div>

          {/* Mobile Filter Menu */}
          {isFilterMenuOpen && (
            <div className="p-3 mb-4 duration-300 rounded-lg bg-gray-50 animate-in fade-in">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <span className="text-sm font-medium">Category:</span>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {query?.data?.data?.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <span className="text-sm font-medium">Price:</span>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="w-full h-8 mt-1 text-sm">
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
                    <SelectTrigger className="w-full h-8 mt-1 text-sm">
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
                  <Select value={sortByDate} onValueChange={setSortByDate}>
                    <SelectTrigger className="w-[160px] h-8 text-sm">
                      <SelectValue placeholder="Relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Date: Oldest First</SelectItem>
                      <SelectItem value="desc">Date: Newest First</SelectItem>
                      {/* <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-around">
            <Link href="/cart" className="relative flex flex-col items-center">
              <ShoppingCart className="w-5 h-5 mb-1" />
              {totalItems > 0 && (
                <span className="absolute flex items-center justify-center w-4 h-4 text-xs rounded-full -top-1 -right-1 bg-primary text-primary-foreground">
                  {totalItems}
                </span>
              )}
              <span className="text-xs">Cart</span>
            </Link>
            <Link href="/profile" className="flex flex-col items-center">
              <User className="w-5 h-5 mb-1" />
              <span className="text-xs">Profile</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
