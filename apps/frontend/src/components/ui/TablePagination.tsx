import { Button, Flex, Text, Icon } from "@chakra-ui/react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/icons";
import { useI18nContext } from "@/i18n/i18n-react";
import { useCallback } from "react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const TablePagination = ({ currentPage, totalPages, onPageChange }: TablePaginationProps) => {
  const { LL } = useI18nContext();

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  return (
    <Flex justify="center" align="center" gap={4} px={4}>
      <Button
        aria-label={LL.pagination.previous_page()}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        bg="gray.100"
        borderRadius="lg"
        minW={12}
        h={12}
        p={0}
        _hover={{ bg: "gray.200" }}
        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}>
        <Icon as={ArrowLeftIcon} boxSize={5} color="gray.600" aria-hidden />
      </Button>

      <Text fontSize="sm" color="gray.600" fontWeight={500} minW="60px" textAlign="center">
        {LL.pagination.page_of({ current: currentPage, total: totalPages })}
      </Text>

      <Button
        aria-label={LL.pagination.next_page()}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        bg="gray.100"
        borderRadius="lg"
        minW={12}
        h={12}
        p={0}
        _hover={{ bg: "gray.200" }}
        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}>
        <Icon as={ArrowRightIcon} boxSize={5} color="gray.600" aria-hidden />
      </Button>
    </Flex>
  );
};
