export default function LoadingButton({
  isLoading,
  disabled,
  children,
  ...props
}) {
  return (
    <button disabled={disabled || isLoading} {...props}>
      {isLoading ? "..." : children}
    </button>
  );
}
