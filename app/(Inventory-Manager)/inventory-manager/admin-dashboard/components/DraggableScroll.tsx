import { useRef } from "react";

export default function DraggableScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const scrollLeft = useRef(0);
  const scrollTop = useRef(0);

  return (
    <div
      ref={ref}
      onMouseDown={(e) => {
        const el = ref.current;
        if (!el) return;

        isDown.current = true;
        startX.current = e.pageX - el.offsetLeft;
        startY.current = e.pageY - el.offsetTop;
        scrollLeft.current = el.scrollLeft;
        scrollTop.current = el.scrollTop;
      }}
      onMouseLeave={() => (isDown.current = false)}
      onMouseUp={() => (isDown.current = false)}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el || !isDown.current) return;

        e.preventDefault();

        const x = e.pageX - el.offsetLeft;
        const y = e.pageY - el.offsetTop;

        el.scrollLeft = scrollLeft.current - (x - startX.current);
        el.scrollTop = scrollTop.current - (y - startY.current);
      }}
      className="custom-scroll h-full w-full cursor-grab overflow-auto active:cursor-grabbing"
    >
      {children}
    </div>
  );
}