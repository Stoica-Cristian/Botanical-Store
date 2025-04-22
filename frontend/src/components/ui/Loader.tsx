import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  color = "accent",
  text,
}) => {
  const sizeMap = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const spinnerSize = sizeMap[size];
  const borderColor = `border-${color}`;

  const spinner = (
    <div
      className={`${spinnerSize} animate-spin rounded-full border-4 border-t-transparent ${borderColor}`}
    ></div>
  );

  return (
    <div className="flex flex-col items-center justify-center py-8">
      {spinner}
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );
};

export default Loader;
