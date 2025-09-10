import React, { type ReactElement, type ReactNode } from "react";

export const ModuleWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const modules = React.Children.toArray(children);

  return modules.map((module, index) => {
    const key = (module as ReactElement).key || `module-${index}`;

    return (
      <React.Fragment key={key}>
        {module}
        {index < modules.length - 1 && (
          <hr className="mx-auto my-4 border-gray-800 dark:border-white" />
        )}
      </React.Fragment>
    );
  });
};
