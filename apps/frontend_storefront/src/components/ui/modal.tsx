import React, { useRef } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const mouseDownTarget = useRef<EventTarget | null>(null);

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    mouseDownTarget.current = event.target;
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    if (
      mouseDownTarget.current === event.currentTarget &&
      event.target === event.currentTarget
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black/30 backdrop-blur-md"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={modalRef}
    >
      {children}
    </div>
  );
};

export default Modal;
