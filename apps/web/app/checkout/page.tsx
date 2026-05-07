import StoreHeader from "@/components/shared/StoreHeader";
import CheckoutForm from "@/components/store/CheckoutForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout — Data Diri",
};

export default function CheckoutPage() {
  return (
    <>
      <StoreHeader />
      <CheckoutForm />
    </>
  );
}