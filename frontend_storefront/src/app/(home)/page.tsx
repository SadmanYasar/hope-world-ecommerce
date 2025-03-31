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
import { ProductCardDetails, MasonryCard } from "@components/ui/masonry-card";
import randomHeight from "@utils/randomHeight";
// import ImageCarousel from "../designs/_components/ImageCarousel";
import Link from "next/link";
import Image from "next/image";
import MultipleSelector, { Option } from "@components/ui/multiple-selector";

// interface MyColorState {
//   brand: string;
//   visibility: string;
//   sortOrderDate: "asc" | "desc" | "none";
//   showOnlyWithImages: boolean;
//   color: Option[];
//   type: Option[];
// }

// type MyColorAction =
//   | { type: "SET_BRAND"; payload: string }
//   | { type: "SET_VISIBILITY"; payload: string }
//   | { type: "SET_SORT_ORDER_DATE"; payload: "asc" | "desc" | "none" }
//   | { type: "SET_SHOW_ONLY_WITH_IMAGES"; payload: boolean }
//   | { type: "SET_COLOR"; payload: Option[] }
//   | { type: "SET_TYPE"; payload: Option[] }
//   | { type: "RESET_FILTERS" };

// const initialState: MyColorState = {
//   brand: "",
//   visibility: "Brand",
//   sortOrderDate: "desc",
//   showOnlyWithImages: false,
//   color: [] as Option[],
//   type: [] as Option[],
// };

// function reducer(state: MyColorState, action: MyColorAction): MyColorState {
//   switch (action.type) {
//     case "SET_BRAND":
//       return { ...state, brand: action.payload };
//     case "SET_VISIBILITY":
//       return { ...state, visibility: action.payload };
//     case "SET_SORT_ORDER_DATE":
//       return { ...state, sortOrderDate: action.payload };
//     case "SET_SHOW_ONLY_WITH_IMAGES":
//       return { ...state, showOnlyWithImages: action.payload };
//     case "SET_COLOR":
//       return { ...state, color: action.payload };
//     case "SET_TYPE":
//       return { ...state, type: action.payload };
//     case "RESET_FILTERS":
//       return initialState;
//     default:
//       return state;
//   }
// }

// type ColorResponse = Partial<
//   Omit<
//     components["schemas"]["ItemsColors"],
//     "SKU_Material_Components" | "Color_Image"
//   > & {
//     SKU_Material_Components: Array<
//       Omit<components["schemas"]["ItemsSKUMaterialComponents"], "SKU"> & {
//         SKU:
//           | (Pick<
//               components["schemas"]["ItemsSKU"],
//               "SKU_ID" | "id" | "Design"
//             > & {
//               Design: { Main_Photo: string | null } | null;
//             })
//           | null;
//       }
//     > | null;
//     Color_Image: { id: string } | null;
//   }
// >;

export default function MyColoursPage() {
  const dataProvider = useDataProvider();
  // const [state, dispatch] = useReducer(reducer, initialState);
  // const { data: roleArray } = usePermissions<string>();
  const { data: user } = useGetIdentity();
  const [filterSheet, setFilterSheet] = useState<boolean>(false);

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

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteList({
    resource: "Products",

    filters: [],
    sorters: [
      // {
      //   field: "date_created",
      //   order: debouncedSortOrder === "asc" ? "asc" : "desc",
      // },
    ],
    meta: {
      fields: ["*"],
    },
    pagination: {
      pageSize: 20,
    },
  });

  const allPages = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page.data),
    [data?.pages]
  );

  if (isLoading) return <>TODO ADD LOADING...</>;

  if (error) return <div>Error: {error.message}</div>;

  if (!data?.pages) return <div>No data found</div>;

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
          <div className="mx-auto w-9 h-9 rounded-full border-t-2 border-b-2 border-gray-900 animate-spin" />
        }
        endMessage={
          <p className="text-center text-gray-500">
            <b>No more items</b>
          </p>
        }
        height={"calc(100vh - 68px)"}
        className="overflow-auto"
        scrollableTarget="scrollableDiv"
      >
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 300: 2, 500: 3, 700: 5, 900: 6 }}
          className="p-5"
        >
          <Masonry gutter="20px">
            {allPages.length === 0 && <div>No data found</div>}

            {allPages.length > 0 &&
              allPages?.map((product, index) => {
                const height = randomHeight(index);
                return (
                  <Sheet key={index}>
                    <SheetTrigger>
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
                        />
                      </MasonryCard>
                    </SheetTrigger>
                    <SheetContent className="flex flex-col">
                      <SheetHeader className="-mb-4">
                        <SheetTitle>Product Item {product?.name}</SheetTitle>
                      </SheetHeader>
                      <div className="overflow-y-auto grow"></div>
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
