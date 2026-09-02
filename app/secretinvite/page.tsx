import { SecretInviteExperience } from "@/components/secret-invite/SecretInviteExperience";
import { secretInviteConfig } from "@/components/secret-invite/secretInviteConfig";

export default function SecretInvitePage() {
  return <SecretInviteExperience active={secretInviteConfig.active} />;
}
