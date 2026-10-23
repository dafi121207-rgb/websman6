import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { SchoolLoading } from "@/components/PageStates";

export default function LoginPage() {
  return (
    <Suspense fallback={<SchoolLoading />}>
      <LoginForm />
    </Suspense>
  );
}
