import { PageContainer } from "@/components/PageContainer";
import { useI18nContext } from "@/i18n/i18n-react";
import { Heading, Link } from "@chakra-ui/react";

export const Home = () => {
  const { LL } = useI18nContext();
  return (
    <PageContainer>
      <PageContainer.Header>
        <Heading fontSize={32} fontWeight={600} color="primary.600" display={"flex"} alignItems={"center"} gap={6}>
          {LL.home.title()}
        </Heading>
      </PageContainer.Header>
      <PageContainer.Content>
        <Link href="/proposals" color="primary.500" fontSize={20} fontWeight={500}>
          {LL.home.go_to_proposals()}
        </Link>
      </PageContainer.Content>
    </PageContainer>
  );
};
