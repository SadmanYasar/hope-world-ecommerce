"use client";

import {
  useInfiniteList,
  BaseRecord,
  CrudFilter,
  BaseKey,
} from "@refinedev/core";
// import Loading from "@components/ui/loading";
// import Breadcrumb from "@components/Breadcrumb";
import InfiniteScroll from "react-infinite-scroll-component";
import { useMemo } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  Sheet,
  SheetContent,
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
import ImageCarousel from "@components/ui/imageCarousel";
import { useFilterStore } from "@store/filter-store";
import { useDebounce } from "@components/ui/multiple-selector";

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

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border-t-2 border-b-2 border-gray-900 rounded-full w-9 h-9 animate-spin" />
    </div>
  );
};

export default function ProductsPage() {
  const { category, sortByDate, search, sortByPrice, priceRange, rating } =
    useFilterStore();

  const debouncedSearch = useDebounce(search, 300);

  // Convert price range selection to filter values
  const getPriceFilters = (): CrudFilter[] => {
    if (!priceRange || priceRange === "all") return [];

    switch (priceRange) {
      case "under25":
        return [
          {
            field: "price",
            operator: "lte",
            value: 25,
          },
        ];
      case "25-50":
        return [
          {
            field: "price",
            operator: "gte",
            value: 25,
          },
          {
            field: "price",
            operator: "lte",
            value: 50,
          },
        ];
      case "50-100":
        return [
          {
            field: "price",
            operator: "gte",
            value: 50,
          },
          {
            field: "price",
            operator: "lte",
            value: 100,
          },
        ];
      case "over100":
        return [
          {
            field: "price",
            operator: "gte",
            value: 100,
          },
        ];
      default:
        return [];
    }
  };

  // Convert rating selection to filter value
  const getRatingFilter = (): CrudFilter[] => {
    if (!rating || rating === "any") return [];

    let minRating = 0;
    switch (rating) {
      case "4plus":
        minRating = 4;
        break;
      case "3plus":
        minRating = 3;
        break;
      case "2plus":
        minRating = 2;
        break;
      case "1plus":
        minRating = 1;
        break;
      default:
        return [];
    }

    return [
      {
        field: "rating",
        operator: "gte",
        value: minRating,
      },
    ];
  };

  const priceFilters = getPriceFilters();
  const ratingFilters = getRatingFilter();

  const { data, isLoading, error, fetchNextPage, hasNextPage } =
    useInfiniteList({
      resource: "products",

      filters: [
        {
          field: "name",
          operator: "containss",
          value: debouncedSearch,
        },
        {
          field: "visible",
          operator: "eq",
          value: true,
        },
        ...(category && category !== "all"
          ? ([
              {
                field: "category!inner(id)",
                operator: "eq",
                value: category,
              },
            ] as CrudFilter[])
          : []),
        ...priceFilters,
        ...ratingFilters,
      ],
      sorters: [
        {
          field: "created_at",
          order: sortByDate === "asc" ? "asc" : "desc",
        },
        {
          field: "price",
          order: sortByPrice === "asc" ? "asc" : "desc",
        },
      ],
      meta: {
        select: "id, name, price, images, category(id,text), rating",
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

  if (isLoading) return <Loading />;

  if (error) return <div>Error: {error.message}</div>;

  // if (!data?.pages) return <div>No data found</div>;

  return (
    <>
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
                        <SheetTitle>{product?.name}</SheetTitle>
                      </SheetHeader>
                      <div className="flex flex-col gap-4 pt-6 overflow-y-auto grow">
                        {/* <div className="aspect-square relative w-full max-w-[300px] mx-auto"> */}
                        {/* <Image
                            src={JSON.parse(product.images ?? "[]")[0]?.url}
                            alt={product.name}
                            fill
                            className="object-cover rounded-md"
                          /> */}
                        {/* </div> */}
                        <ImageCarousel
                          images={JSON.parse(product.images ?? "[]")}
                          className="w-full max-w-[300px] mx-auto"
                          fullScreen
                        />
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
                            <Reviews productId={product.id} />
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

function Reviews({ productId }: { productId?: BaseKey }) {
  const {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    hasPreviousPage,
  } = useInfiniteList({
    resource: "reviews",
    filters: [
      {
        field: "product_id",
        operator: "eq",
        value: productId,
      },
    ],
    pagination: {
      pageSize: 5,
    },
    queryOptions: {
      enabled: !!productId,
    },
    meta: {
      select: "id, product_id, rating, comment, created_at",
    },
  });

  return (
    <div className="mt-4">
      <h4 className="mb-2 font-medium">Reviews:</h4>
      {isLoading && <div>Loading reviews...</div>}
      {error && <div>Error loading reviews: {error.message}</div>}
      {data?.pages?.length === 0 && <div>No reviews found</div>}

      {data?.pages?.map((page) =>
        page.data.map((review: BaseRecord) => (
          <div key={review.id} className="p-4 mb-2 border rounded">
            <p className="text-sm">
              {Array(review.rating).fill("⭐").join("")} -{" "}
              {review.comment || "No comment"}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        ))
      )}

      {(hasNextPage || hasPreviousPage) && (
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage}
          className="mt-2 text-blue-600 hover:underline"
        >
          Load more reviews
        </button>
      )}
    </div>
  );
}
