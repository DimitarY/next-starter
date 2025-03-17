import React, { ReactNode } from "react";

export const ModuleWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const modules = React.Children.toArray(children);

  return modules.map((module, index) => (
    <React.Fragment key={index}>
      {module}
      {index < modules.length - 1 && (
        <hr className="mx-auto my-4 border-gray-800 dark:border-white" />
      )}
    </React.Fragment>
  ));
};
