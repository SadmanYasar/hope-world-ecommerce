import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@components/ui/carousel";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Fullscreen } from "lucide-react";
import Modal from "./modal";

type Props = {
  images?: {
    url: string;
  }[];
  type?: string;
  width?: number;
  height?: number;
  //May need to adjust
  originalWidth?: number;
  originalHeight?: number;

  /** Class name to be applied to the carousel images */
  className?: string;
  fullScreen?: boolean;
};

const ImageCarousel = ({
  images,
  type,
  height,
  width,
  fullScreen,
  className,
}: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  let [galleryOpen, setGalleryOpen] = useState(false);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      <>
        {fullScreen && (
          <button
            className="absolute top-16 right-4 z-[1] bg-[#2E3947] h-[24px] w-[24px] shadow rounded-full flex items-center justify-center group hover:bg-[#CBB468] hover:scale-110"
            onClick={() => setGalleryOpen(true)}
          >
            <Fullscreen className="w-3 h-3 text-white" />
          </button>
        )}
        <Carousel setApi={setApi} className={`w-full`}>
          <CarouselContent>
            {Array.from({ length: images.length }).map((_, index) => (
              <CarouselItem key={index} className="w-full">
                <div className="aspect-square relative w-full max-w-[300px] mx-auto">
                  <Image
                    src={images[index]?.url ?? ""}
                    alt={""}
                    fill
                    className="object-cover bg-gray-300 rounded-md"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="absolute flex justify-around w-full bottom-4">
            <CarouselPrevious className="relative" />
            <CarouselNext className="relative" />
          </div>
        </Carousel>
      </>

      <Modal isOpen={galleryOpen} onClose={() => setGalleryOpen(false)}>
        <Carousel
          className="w-full max-w-md"
          opts={{
            startIndex: current - 1,
          }}
        >
          <CarouselContent>
            {Array.from({ length: images.length }).map((_, index) => (
              <CarouselItem key={index} className="w-full">
                <div className="relative w-full mx-auto aspect-square">
                  <Image
                    src={images[index]?.url}
                    alt={""}
                    className="object-cover bg-gray-300 rounded-md"
                    fill
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4" />
          <CarouselNext className="absolute right-4" />
        </Carousel>
      </Modal>
    </>
  );
};

export default ImageCarousel;
