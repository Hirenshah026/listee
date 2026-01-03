import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  return (
    <>
      <PageMeta
        title="Bundekhand Dental Lab Jhansi"
        description="Bundekhand Dental Lab Jhansi"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
