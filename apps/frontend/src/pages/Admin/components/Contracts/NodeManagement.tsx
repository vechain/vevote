import { 
  Box, 
  Heading, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  Spinner, 
  Alert, 
  AlertIcon, 
  VStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  Divider,
  Text
} from "@chakra-ui/react";
import { useState } from "react";
import { useUserNodeInfo } from "../../hooks";
import { useI18nContext } from "@/i18n/i18n-react";

export function NodeManagement() {
  const { LL } = useI18nContext();
  const [userAddress, setUserAddress] = useState("");
  const [searchAddress, setSearchAddress] = useState("");
  
  const { data: userNodeInfo, isLoading, error } = useUserNodeInfo(searchAddress);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userAddress.trim()) {
      setSearchAddress(userAddress.trim());
    }
  };

  return (
    <Box>
      <Heading size="md" mb={6}>
        {LL.admin.node_management.title()}
      </Heading>
      
      <Box mb={8}>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>{LL.admin.node_management.user_address_label()}</FormLabel>
            <Input
              placeholder={LL.admin.node_management.user_address_placeholder()}
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isLoading}
            loadingText={LL.admin.node_management.loading_button()}
          >
            {LL.admin.node_management.load_button()}
          </Button>
        </form>
      </Box>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {LL.admin.node_management.error({ error: error instanceof Error ? error.message : 'Unknown error' })}
        </Alert>
      )}

      {isLoading && searchAddress && (
        <VStack spacing={4} align="center" py={8}>
          <Spinner size="lg" />
          <Text>{LL.admin.node_management.loading_text()}</Text>
        </VStack>
      )}

      {userNodeInfo && (
        <Box>
          <Heading size="sm" mb={4}>
            {LL.admin.node_management.node_info_title({ address: searchAddress })}
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Stat>
              <StatLabel>{LL.admin.node_management.is_node_holder()}</StatLabel>
              <StatNumber>{userNodeInfo.isNodeHolder ? LL.admin.node_management.yes() : LL.admin.node_management.no()}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>{LL.admin.node_management.is_node_delegator()}</StatLabel>
              <StatNumber>{userNodeInfo.isNodeDelegator ? LL.admin.node_management.yes() : LL.admin.node_management.no()}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>{LL.admin.node_management.owned_nodes()}</StatLabel>
              <StatNumber>{userNodeInfo.ownedNodes.length}</StatNumber>
              {userNodeInfo.ownedNodes.length > 0 && (
                <Text fontSize="sm" mt={2}>
                  {LL.admin.node_management.ids_label({ ids: userNodeInfo.ownedNodes.map(id => id.toString()).join(", ") })}
                </Text>
              )}
            </Stat>

            <Stat>
              <StatLabel>{LL.admin.node_management.managed_nodes()}</StatLabel>
              <StatNumber>{userNodeInfo.managedNodes.length}</StatNumber>
              {userNodeInfo.managedNodes.length > 0 && (
                <Text fontSize="sm" mt={2}>
                  {LL.admin.node_management.ids_label({ ids: userNodeInfo.managedNodes.map(id => id.toString()).join(", ") })}
                </Text>
              )}
            </Stat>
          </SimpleGrid>
        </Box>
      )}

      <Divider my={8} />
      
      <Box>
        <Heading size="sm" mb={4}>{LL.admin.node_management.methods_title()}</Heading>
        <Text fontSize="sm" color="gray.600">
          {LL.admin.node_management.methods_description()}
        </Text>
      </Box>
    </Box>
  );
}