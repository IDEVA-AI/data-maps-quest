import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type LandingCarouselProps = {
  images?: string[];
};

// Pequeno carrossel com 5 imagens; ao clicar, abre visualização maior (modal)
const LandingCarousel: React.FC<LandingCarouselProps> = ({
  images = [
    "/landing-1.png",
    "/landing-2.png",
    "/landing-3.png",
    "/landing-4.png",
    "/landing-5.png",
  ],
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(2);
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi | null>(null);
  const initializedRef = React.useRef(false);
  const intervalRef = React.useRef<number | null>(null);

  const stopAutoplay = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = React.useCallback(() => {
    // Reinicia o autoplay apenas quando a API está disponível
    if (!carouselApi) return;
    stopAutoplay();
    intervalRef.current = window.setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);
  }, [carouselApi, stopAutoplay]);

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
    setOpen(true);
  };

  const fallback = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.currentTarget as HTMLImageElement).src = "/placeholder.svg";
  };

  const nextImage = () => {
    setSelectedIndex((prev) => {
      const next = (prev + 1) % images.length;
      carouselApi?.scrollTo(next);
      return next;
    });
  };

  const prevImage = () => {
    setSelectedIndex((prev) => {
      const next = (prev - 1 + images.length) % images.length;
      carouselApi?.scrollTo(next);
      return next;
    });
  };

  // Sincroniza com Embla, centraliza na 3ª imagem e cria auto-avance controlado
  React.useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);

    // Centraliza inicialmente na 3ª imagem (index 2), uma única vez
    if (!initializedRef.current && images.length >= 3) {
      initializedRef.current = true;
      carouselApi.scrollTo(2);
    }

    // Inicia autoplay
    startAutoplay();

    return () => {
      carouselApi.off("select", onSelect);
      stopAutoplay();
    };
  }, [carouselApi, startAutoplay, stopAutoplay]);

  return (
    <div className="relative">
      <Carousel
        opts={{ align: "center", loop: true }}
        setApi={setCarouselApi}
        className="mx-auto w-full max-w-7xl px-4"
        onMouseEnter={stopAutoplay}
        onMouseLeave={startAutoplay}
      >
        <CarouselContent>
          {images.map((src, idx) => (
            <CarouselItem
              key={idx}
              className={`${
                idx === selectedIndex
                  ? "basis-3/4 md:basis-2/3 lg:basis-1/2 mx-8 md:mx-10"
                  : "basis-1/2 md:basis-2/5 lg:basis-1/3"
              } pl-8 md:pl-10`}
            >
              <Card
                className={`cursor-pointer transition-all duration-700 ease-out hover:shadow-lg bg-background rounded-xl ${
                  idx === selectedIndex ? "overflow-visible z-20" : "overflow-hidden opacity-90"
                }`}
                onClick={() => handleOpen(idx)}
              >
                <img
                  src={src}
                  alt={`Preview ${idx + 1}`}
                  onError={fallback}
                  className="w-full h-auto object-contain"
                />
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-8" />
        <CarouselNext className="-right-8" />
      </Carousel>

      {/* Modal para visualizar maior */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl">
          <div className="flex items-center justify-between gap-4">
            <Button variant="secondary" size="icon" onClick={prevImage} aria-label="Anterior" className="shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="relative w-full">
              <img
                src={images[selectedIndex]}
                alt="Imagem ampliada"
                onError={fallback}
                onClick={nextImage}
                className="w-full h-auto object-contain cursor-pointer"
              />
            </div>
            <Button variant="secondary" size="icon" onClick={nextImage} aria-label="Próxima" className="shrink-0">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingCarousel;