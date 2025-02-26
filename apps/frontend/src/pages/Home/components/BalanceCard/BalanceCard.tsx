import { Card, CardBody, HStack, Image, Text } from "@chakra-ui/react"
import { useVeVoteBalance } from "@/hooks/useVeVoteBalance"

export const BalanceCard = () => {
  const { balance } = useVeVoteBalance()
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
  )
}
