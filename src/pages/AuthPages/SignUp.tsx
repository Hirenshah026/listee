import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignUpForm from "../../components/auth/SignUpForm";

export default function SignUp() {
  return (
    <>
      <PageMeta
        title="Bundekhand Detal Lab Jhansi"
        description="Bundekhand Detal Lab Jhansi"
      />
      <AuthLayout>
        <SignUpForm />
      </AuthLayout>
    </>
  );
}
