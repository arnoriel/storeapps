import StoreHeader from "@/components/shared/StoreHeader";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StoreHeader />
      {children}
    </>
  );
}