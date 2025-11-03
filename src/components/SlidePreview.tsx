import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  title: string;
  content: string[];
  notes?: string;
}

interface SlidePreviewProps {
  slides: Slide[];
}

export function SlidePreview({ slides }: SlidePreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!slides || slides.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No slides to display
      </Card>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="space-y-4">
      <Card className="p-8 min-h-[500px] bg-gradient-to-br from-card via-card to-primary/5 shadow-elegant border-primary/10 transition-all duration-300">
        <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          {slide.title}
        </h3>
        <ul className="space-y-4">
          {slide.content.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
              <span className="text-primary mt-1 text-xl font-bold">•</span>
              <span className="text-lg leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        {slide.notes && (
          <div className="mt-8 pt-6 border-t border-primary/20">
            <p className="text-sm text-muted-foreground">
              <strong className="text-primary">Notes:</strong> {slide.notes}
            </p>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between bg-card/50 p-4 rounded-lg border border-primary/10">
        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="hover:bg-primary/10 hover:border-primary/30 transition-all"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="hover:bg-primary/10 hover:border-primary/30 transition-all"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
