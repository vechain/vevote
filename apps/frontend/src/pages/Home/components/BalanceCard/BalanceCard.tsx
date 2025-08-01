import { Card, CardBody, HStack, Image, Text } from "@chakra-ui/react";

export const BalanceCard = () => {
  const balance = 0; // Placeholder - hook removed
  return (
    <Card>
      <CardBody>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            Balance
          </Text>
          <HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {balance}
            </Text>
            <Image src={"/images/vevote.jpeg"} alt="VET" boxSize="8" />
          </HStack>
        </HStack>
      </CardBody>
    </Card>
  );
};
