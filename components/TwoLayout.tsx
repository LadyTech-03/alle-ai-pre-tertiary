import React, { ReactNode } from "react";

interface ApiDocLayoutProps {
  leftContent: ReactNode;
  rightContent: ReactNode;
}

const ApiDocLayout: React.FC<ApiDocLayoutProps> = ({
  leftContent,
  rightContent,
}) => {
  return (
    <div className=" mx-auto max-w-7xl mb-10">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Use flex */}
        <div className="prose max-w-none lg:w-1/2 flex-grow">
          {/* flex-grow for left */}
          {leftContent}
        </div>
        <div className="relative lg:w-1/2 hidden lg:block">
          {/* Right side */}
          <div className="sticky top-4 overflow-auto rounded-lg scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200">
            {rightContent}
          </div>
        </div>
        <div className="lg:hidden rounded-lg">{rightContent}</div>
      </div>
    </div>
  );
};

export default ApiDocLayout;
