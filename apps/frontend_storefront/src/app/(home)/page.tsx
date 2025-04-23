"use client";

import { Suspense } from "react";

import {
  useInfiniteList,
  Authenticated,
  useDataProvider,
  CanAccess,
  CrudFilter,
  usePermissions,
  useGetIdentity,
  useList,
  useCustom,
  BaseRecord,
  useLogout,
} from "@refinedev/core";
// import Loading from "@components/ui/loading";
// import Breadcrumb from "@components/Breadcrumb";
import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useMemo, useState, useReducer } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@components/ui/sheet";
import {
  ProductCardDetails,
  MasonryCard,
  AddToCartButton,
} from "@components/ui/masonry-card";
import randomHeight from "@utils/randomHeight";
// import ImageCarousel from "../designs/_components/ImageCarousel";
import Link from "next/link";
import Image from "next/image";
import MultipleSelector, { Option } from "@components/ui/multiple-selector";
import { supabaseBrowserClient } from "@utils/supabase/client";
import { AnyNsRecord } from "dns";
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  images: string;
  rating?: number;
}

interface GetProductsResponse {
  data: Product[];
  nextPage: number | null;
}

export default function MyColoursPage() {
  const dataProvider = useDataProvider();
  // const [state, dispatch] = useReducer(reducer, initialState);
  // const { data: roleArray } = usePermissions<string>();
  // const { data: user } = useGetIdentity();
  const [filterSheet, setFilterSheet] = useState<boolean>(false);
  // const [page, setPage] = useState(1);
  // const [products, setProducts] = useState<Product[]>([]);
  // const [hasNextPage, setHasNextPage] = useState(true);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // const loadMore = async () => {
  //   if (!hasNextPage) return;

  //   try {
  //     const { data, nextPage } = (await getProducts(
  //       page
  //     )) as GetProductsResponse;
  //     setProducts((prev) => [...prev, ...data]);
  //     setPage((prev) => prev + 1);
  //     setHasNextPage(!!nextPage);
  //   } catch (err: unknown) {
  //     if (err instanceof Error) {
  //       setError(err.message);
  //     } else {
  //       setError("An unknown error occurred");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const fetchNextPage = async () => {
  //   if (!hasNextPage || isLoading) return;
  //   await loadMore();
  // };

  // useEffect(() => {
  //   loadMore();
  // }, []);

  // Replace the useInfiniteList with:
  // const allPages = useMemo(() => products, [products]);
  // const role = roleArray?.[0] ?? "";

  // const debouncedBrand = useDebounce(state.brand, 300);
  // const debouncedVisibility = useDebounce(state.visibility, 300);
  // const debouncedSortOrder = useDebounce(state.sortOrderDate, 300);
  // const debouncedShowOnlyWithImages = useDebounce(
  //   state.showOnlyWithImages,
  //   300,
  // );
  // const debouncedTypeFilter = useDebounce(state.type, 300);
  // const debouncedColorFilter = useDebounce(state.color, 300);

  //TODO - NEED TO MAKE THIS SERVER ACTION AS SUPABASE DOES NOT SHOW PUBLIC DATA WITHOUT LOGIN
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteList({
    resource: "products",

    filters: [
      //TODO
    ],
    sorters: [
      // {
      //   field: "date_created",
      //   order: debouncedSortOrder === "asc" ? "asc" : "desc",
      // },
    ],
    meta: {
      select: "id, name, price, images,  category(id,text)",
    },
    pagination: {
      pageSize: 20,
    },
    queryOptions: {
      enabled: true,
    },
  });

  const allPages = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data),
    [data?.pages]
  );

  if (isLoading) return <>TODO ADD LOADING...</>;

  if (error) return <div>Error: {error.message}</div>;

  // if (!data?.pages) return <div>No data found</div>;

  return (
    <>
      <div>
        {/* <CanAccess resource="Colors" action="filter"> */}
        <div className="absolute w-10 left-0 right-0 ml-auto mr-auto z-50 mt-[19px] -top-[4px]">
          <div className="inline-flex items-center justify-center gap-[13px]">
            {/* <ToggleGold /> */}
            {/* <SortButton
              state={state}
              dispatch={dispatch}
              setFilter={setFilterSheet}
              sortList={[
                {
                  title: "Date: Latest",
                  value: "desc",
                  key: "sortOrderDate",
                  action: (value: string) =>
                    ({
                      type: "SET_SORT_ORDER_DATE",
                      payload: value,
                    } as MyColorAction),
                },
                {
                  title: "Date: Earliest",
                  value: "asc",
                  key: "sortOrderDate",
                  action: (value: string) =>
                    ({
                      type: "SET_SORT_ORDER_DATE",
                      payload: value,
                    } as MyColorAction),
                },
                // {
                //   title: "Reset Filters",
                //   value: "reset",
                //   action: () => ({ type: "RESET_FILTERS" }) as MyColorAction,
                // },
              ]}
            /> */}
          </div>
        </div>
        <div className="absolute right-3 top-[84px] z-[50]">
          <Sheet open={filterSheet} onOpenChange={setFilterSheet}>
            <SheetContent className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Filter</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col grow">
                <div className="p-5 space-y-4 grow">
                  <input className="hidden" />
                  {/* <MultipleSelector
                    placeholder="Select Type"
                    label="Type"
                    maxSelected={5}
                    delay={300}
                    options={Color_Type_Values?.data ?? []}
                    value={state.type}
                    onChange={(options: Option[]) =>
                      dispatch({ type: "SET_TYPE", payload: options })
                    }
                    emptyIndicator={
                      <p className="w-full text-lg leading-10 text-center text-muted-foreground">
                        No results found.
                      </p>
                    }
                  />
                  <MultipleSelector
                    placeholder="Select Colour"
                    label="Colour"
                    maxSelected={5}
                    delay={300}
                    options={Color_List_Values?.data ?? []}
                    value={state.color}
                    onChange={(options: Option[]) =>
                      dispatch({ type: "SET_COLOR", payload: options })
                    }
                    emptyIndicator={
                      <p className="w-full text-lg leading-10 text-center text-muted-foreground">
                        No results found.
                      </p>
                    }
                  /> */}
                </div>
                <div className="grid gap-4 p-5">
                  <Button onClick={() => setFilterSheet(false)}>Save</Button>
                  {/* <Button
                    onClick={resetFilter}
                    variant="ghost"
                    className="text-destructive"
                  >
                    Reset Filter
                  </Button> */}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        {/* </CanAccess> */}
      </div>

      <InfiniteScroll
        dataLength={allPages.length}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        loader={
          <div className="mx-auto border-t-2 border-b-2 border-gray-900 rounded-full w-9 h-9 animate-spin" />
        }
        height={"calc(100vh - 68px)"}
        className="overflow-auto"
        scrollableTarget="scrollableDiv"
      >
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 300: 2, 500: 2, 700: 5, 900: 6 }}
          className="p-5"
        >
          <Masonry gutter="20px">
            {allPages.length === 0 && <div>No data found</div>}

            {allPages.length > 0 &&
              allPages?.map((product, index) => {
                const height = randomHeight(index);
                return (
                  <Sheet key={index}>
                    <SheetTrigger className="p-0 bg-none">
                      <MasonryCard
                        imageAlt={`Image of product item ${product.id}`}
                        imageUrl={JSON.parse(product.images ?? "[]")[0]?.url}
                        imageWidth={400}
                        imageHeight={height}
                      >
                        <ProductCardDetails
                          name={product.name ?? ""}
                          price={product.price}
                          rating={product.rating ?? 0}
                          product={product as any}
                        />
                      </MasonryCard>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col">
                      <SheetHeader className="-mb-4">
                        <SheetTitle>Product Item {product?.name}</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-4 pt-6 overflow-y-auto grow">
                        <div className="aspect-square relative w-full max-w-[300px] mx-auto">
                          <Image
                            src={JSON.parse(product.images ?? "[]")[0]?.url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold">
                            {product.name}
                          </h3>
                          <p className="text-lg font-bold">${product.price}</p>
                          <div className="py-2">
                            <AddToCartButton
                              product={product as any}
                              className="w-full"
                            />
                          </div>
                          <div className="pt-4">
                            <h4 className="mb-2 font-medium">
                              Product Details:
                            </h4>
                            <p className="text-sm text-gray-600">
                              {product.category?.text && (
                                <span>Category: {product.category.text}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                );
              })}
          </Masonry>
        </ResponsiveMasonry>
      </InfiniteScroll>
    </>
  );
}
