interface DocumentWrapperProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function DocumentWrapper({ children, style }: DocumentWrapperProps) {
  return (
    <div 
      className="bg-white shadow-sm rounded-lg p-8"
      style={style}
    >
      {children}
    </div>
  );
}
