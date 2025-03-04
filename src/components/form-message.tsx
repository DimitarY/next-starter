import {
  CheckCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";

interface FormMessageProps {
  message?: string;
}

export const FormSuccess = ({ message }: FormMessageProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircledIcon className="size-4" />
      <p>{message}</p>
    </div>
  );
};

export const FormError = ({ message }: FormMessageProps) => {
  if (!message) return null;

  return (
    <div className="bg-destructive/15 text-destructive flex items-center gap-x-2 rounded-md p-3 text-sm">
      <ExclamationTriangleIcon className="size-4" />
      <p>{message}</p>
    </div>
  );
};
