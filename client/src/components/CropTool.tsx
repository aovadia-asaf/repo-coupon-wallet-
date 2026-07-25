import { useRef, useState } from "react";
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from "react-image-crop";

interface Props {
  src: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}

function centerInitialCrop(width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, width / height, width, height),
    width,
    height,
  );
}

async function cropToBlob(image: HTMLImageElement, crop: PixelCrop): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const canvas = document.createElement("canvas");
  canvas.width = crop.width * scaleX;
  canvas.height = crop.height * scaleY;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("חיתוך נכשל"))),
      "image/jpeg",
      0.92,
    );
  });
}

export function CropTool({ src, onCancel, onConfirm }: Props) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>();
  const [busy, setBusy] = useState(false);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerInitialCrop(width, height));
  }

  async function handleConfirm() {
    if (!imgRef.current || !pixelCrop) return;
    setBusy(true);
    try {
      const blob = await cropToBlob(imgRef.current, pixelCrop);
      onConfirm(blob);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <ReactCrop crop={crop} onChange={setCrop} onComplete={setPixelCrop}>
        <img ref={imgRef} src={src} alt="לחיתוך" onLoad={handleImageLoad} style={{ maxWidth: "100%" }} />
      </ReactCrop>
      <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          ביטול
        </button>
        <button type="button" className="btn btn-primary" onClick={handleConfirm} disabled={busy || !pixelCrop}>
          {busy ? "שומר..." : "אישור חיתוך"}
        </button>
      </div>
    </div>
  );
}
