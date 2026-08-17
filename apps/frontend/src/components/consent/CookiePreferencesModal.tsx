import { ModalSkeleton, ModalTitle } from "@/components/ui/ModalSkeleton";
import { useCookieConsent } from "@/contexts/CookieConsentProvider";
import { useI18nContext } from "@/i18n/i18n-react";
import { CONSENT_INVENTORY, ConsentCategory, ConsentPreferences, OPTIONAL_CONSENT_CATEGORIES } from "@/types/consent";
import { Box, Button, Divider, Flex, ModalBody, ModalFooter, ModalHeader, Switch, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

/**
 * Granular preference centre. Also the place where the user can see and take
 * away a copy of their own consent record, which is what "provide documentation
 * of consent" means from the user's side.
 */
export const CookiePreferencesModal = () => {
  const { LL } = useI18nContext();
  const { isPreferencesOpen, closePreferences, preferences, savePreferences, record, exportProof } = useCookieConsent();

  const [draft, setDraft] = useState<ConsentPreferences>(preferences);

  // Re-sync whenever the modal is (re)opened, so it always reflects reality.
  useEffect(() => {
    if (isPreferencesOpen) setDraft(preferences);
  }, [isPreferencesOpen, preferences]);

  const toggle = useCallback((category: ConsentCategory, value: boolean) => {
    setDraft(previous => ({ ...previous, [category]: value }));
  }, []);

  const onSave = useCallback(() => {
    savePreferences(draft);
    closePreferences();
  }, [draft, savePreferences, closePreferences]);

  const onDownloadProof = useCallback(() => {
    const blob = new Blob([exportProof()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vevote-consent-record.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }, [exportProof]);

  return (
    <ModalSkeleton isOpen={isPreferencesOpen} onClose={closePreferences} contentProps={{ maxWidth: { md: "560px" } }}>
      <ModalHeader>
        <ModalTitle title={LL.consent.preferences.title()} />
      </ModalHeader>
      <ModalBody>
        <Flex flexDirection="column" gap={5}>
          <Text fontSize={14} color="gray.600">
            {LL.consent.preferences.description()}
          </Text>

          <CategoryRow
            title={LL.consent.categories.necessary.title()}
            description={LL.consent.categories.necessary.description()}
            services={CONSENT_INVENTORY[ConsentCategory.NECESSARY]}
            isChecked
            isDisabled
            lockedLabel={LL.consent.preferences.always_active()}
          />

          {OPTIONAL_CONSENT_CATEGORIES.map(category => (
            <CategoryRow
              key={category}
              title={LL.consent.categories.analytics.title()}
              description={LL.consent.categories.analytics.description()}
              services={CONSENT_INVENTORY[category]}
              isChecked={draft[category]}
              onChange={value => toggle(category, value)}
            />
          ))}

          {record && (
            <>
              <Divider />
              <Box>
                <Text fontSize={14} fontWeight={600} color="gray.700">
                  {LL.consent.proof.title()}
                </Text>
                <Text fontSize={13} color="gray.500" marginTop={1}>
                  {LL.consent.proof.description({
                    id: record.id,
                    date: new Date(record.timestamp).toLocaleString(),
                    version: record.version,
                  })}
                </Text>
                <Button variant="ghost" size="sm" marginTop={2} paddingX={0} onClick={onDownloadProof}>
                  {LL.consent.proof.download()}
                </Button>
              </Box>
            </>
          )}
        </Flex>
      </ModalBody>
      <ModalFooter gap={3} flexDirection={{ base: "column", sm: "row" }}>
        <Button variant="secondary" size="md" width={{ base: "full", sm: "auto" }} onClick={closePreferences}>
          {LL.consent.actions.cancel()}
        </Button>
        <Button variant="primary" size="md" width={{ base: "full", sm: "auto" }} onClick={onSave}>
          {LL.consent.actions.save()}
        </Button>
      </ModalFooter>
    </ModalSkeleton>
  );
};

type CategoryRowProps = {
  title: string;
  description: string;
  services: string[];
  isChecked: boolean;
  isDisabled?: boolean;
  lockedLabel?: string;
  onChange?: (value: boolean) => void;
};

const CategoryRow = ({
  title,
  description,
  services,
  isChecked,
  isDisabled,
  lockedLabel,
  onChange,
}: CategoryRowProps) => {
  return (
    <Flex gap={4} alignItems="start" justifyContent="space-between">
      <Box flex={1}>
        <Text fontSize={15} fontWeight={600} color="gray.700">
          {title}
        </Text>
        <Text fontSize={13} color="gray.500" marginTop={1}>
          {description}
        </Text>
        <Text fontSize={12} color="gray.400" marginTop={1}>
          {services.join(" · ")}
        </Text>
      </Box>
      {isDisabled ? (
        <Text fontSize={12} fontWeight={600} color="gray.400" flexShrink={0} paddingTop={1}>
          {lockedLabel}
        </Text>
      ) : (
        <Switch
          isChecked={isChecked}
          onChange={event => onChange?.(event.target.checked)}
          aria-label={title}
          flexShrink={0}
        />
      )}
    </Flex>
  );
};
