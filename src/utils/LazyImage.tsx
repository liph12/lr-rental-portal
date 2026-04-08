import { useEffect, useRef, useState } from "react";

export const LazyImage = ({
  src,
  size = 30,
}: {
  src: string;
  size?: number;
}) => {
  const ref = useRef<HTMLImageElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={visible ? src : undefined}
      loading="lazy"
      style={{
        height: "auto",
        width: size,
        objectFit: "contain",
      }}
    />
  );
};
