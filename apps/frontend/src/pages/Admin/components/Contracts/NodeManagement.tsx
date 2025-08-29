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

export function NodeManagement() {
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
        Node Management Contract Information
      </Heading>
      
      <Box mb={8}>
        <form onSubmit={handleSubmit}>
          <FormControl mb={4}>
            <FormLabel>User Address</FormLabel>
            <Input
              placeholder="Enter user address (0x...)"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isLoading}
            loadingText="Loading..."
          >
            Load User Node Info
          </Button>
        </form>
      </Box>

      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading node data: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      )}

      {isLoading && searchAddress && (
        <VStack spacing={4} align="center" py={8}>
          <Spinner size="lg" />
          <Text>Loading user node information...</Text>
        </VStack>
      )}

      {userNodeInfo && (
        <Box>
          <Heading size="sm" mb={4}>
            Node Information for {searchAddress}
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <Stat>
              <StatLabel>Is Node Holder</StatLabel>
              <StatNumber>{userNodeInfo.isNodeHolder ? "Yes" : "No"}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Is Node Delegator</StatLabel>
              <StatNumber>{userNodeInfo.isNodeDelegator ? "Yes" : "No"}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Owned Nodes</StatLabel>
              <StatNumber>{userNodeInfo.ownedNodes.length}</StatNumber>
              {userNodeInfo.ownedNodes.length > 0 && (
                <Text fontSize="sm" mt={2}>
                  IDs: {userNodeInfo.ownedNodes.map(id => id.toString()).join(", ")}
                </Text>
              )}
            </Stat>

            <Stat>
              <StatLabel>Managed Nodes</StatLabel>
              <StatNumber>{userNodeInfo.managedNodes.length}</StatNumber>
              {userNodeInfo.managedNodes.length > 0 && (
                <Text fontSize="sm" mt={2}>
                  IDs: {userNodeInfo.managedNodes.map(id => id.toString()).join(", ")}
                </Text>
              )}
            </Stat>
          </SimpleGrid>
        </Box>
      )}

      <Divider my={8} />
      
      <Box>
        <Heading size="sm" mb={4}>Available Methods</Heading>
        <Text fontSize="sm" color="gray.600">
          This component demonstrates the NodeManagementService functionality.
          You can extend it to show additional statistics like total nodes, delegation stats, etc.
        </Text>
      </Box>
    </Box>
  );
}