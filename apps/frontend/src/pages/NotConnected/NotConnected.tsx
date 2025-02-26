import { Image, VStack } from "@chakra-ui/react"
import { motion } from "framer-motion"

export const NotConnected = () => {
  return (
    <VStack align="center" justify="center" h="full">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 365],
        }}>
        <Image src={"/images/vevote.jpeg"} alt="Not Connected" w={"400px"} h="400px" rounded="full" />
      </motion.div>
    </VStack>
  )
}
