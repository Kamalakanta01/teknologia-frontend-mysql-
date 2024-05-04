import React, { useEffect, useState } from 'react';
import axios from "axios";
import { Spinner, Alert, AlertIcon } from '@chakra-ui/react';

import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  UnorderedList,
  ListItem,
  FormControl,
  FormLabel,
  FormHelperText,
  InputGroup,
  CloseButton
} from '@chakra-ui/react';

function Main() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingData, setIsDeletingData] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('name', name);
    formData.append('password', password);
    formData.append('resume', selectedFile);

    try {
      const response = await axios.post('https://teknologia-backend-mysql.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      fetchData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error === 'Duplicate resume detected') {
        setErrorMessage('Duplicate resume detected. Please upload a different resume.');
      } else {
        console.error("Error uploading resume:", error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`https://teknologia-backend-mysql.onrender.com/data?page=${currentPage}`);
      console.log(response.data.data.length)
      setData(response.data.data);
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadResume = async (fileData) => {
    const blob = new Blob([new Uint8Array(fileData.data)], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'resume.pdf'); // Set the file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDelete = async (id) => {
    setIsDeletingData(true);
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`https://teknologia-backend-mysql.onrender.com/data/${id}`);
        fetchData();
      } catch (error) {
        console.error("Error deleting data:", error);
      } finally {
        setIsDeletingData(false);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleCloseAlert = () => {
    setErrorMessage('');
  };

  return (
    <Box
      bg="gray.100"
      p={8}
      borderRadius="md"
      boxShadow="md"
      maxW="md"
      mx="auto"
    >
      <Heading as="h2" size="xl" mb={6} color="blue.500" textAlign="center">
        File Uploader
      </Heading>
      {errorMessage && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {errorMessage}
          <CloseButton position="absolute" right="8px" top="8px" onClick={handleCloseAlert} />
        </Alert>
      )}
      <Box mb={4}>
        <FormControl>
          <FormLabel fontWeight="semibold">Name</FormLabel>
          <Input
            type="text"
            value={name}
            onChange={handleNameChange}
            placeholder="Enter your name"
            borderColor="blue.300"
          />
        </FormControl>
      </Box>
      <Box mb={4}>
        <FormControl>
          <FormLabel fontWeight="semibold">Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            borderColor="blue.300"
          />
        </FormControl>
      </Box>
      <Box mb={6}>
        <FormControl>
          <FormLabel fontWeight="semibold">Upload Resume</FormLabel>
          <InputGroup>
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              borderColor="blue.300"
            />
            {/* <InputRightAddon
              children={isSubmitting ? <Spinner size="sm" /> : "Upload"}
              cursor={isSubmitting ? "not-allowed" : "pointer"}
              bg={isSubmitting ? "gray.300" : "blue.500"}
              color={isSubmitting ? "gray.500" : "white"}
              borderRadius="md"
              _hover={{ bg: isSubmitting ? "gray.300" : "blue.600" }}
            /> */}
          </InputGroup>
          <FormHelperText color="gray.500">Only PDF files are allowed.</FormHelperText>
        </FormControl>
      </Box>
      <Button
        onClick={handleSubmit}
        colorScheme="blue"
        mb={8}
        w="full"
        fontWeight="semibold"
        isLoading={isSubmitting}
      >
        Submit
      </Button>
      <Heading as="h2" size="lg" mb={4} color="blue.500">
        Data
      </Heading>
      <Box bg="white" p={4} borderRadius="md" boxShadow="md">
        {isLoading ? (
          <Spinner />
        ) : data.length > 0 ? (
          <UnorderedList spacing={4}>
            {data.map((item) => (
              <ListItem key={item.id} display="flex" alignItems="center">
                <Text fontWeight="semibold" mr={4}>
                  Name: {item.name}
                </Text>
                <Button
                  onClick={() => handleDownloadResume(item.file)}
                  colorScheme="blue"
                  mr={2}
                  size="sm"
                >
                  Download Resume
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  colorScheme="red"
                  size="sm"
                  isLoading={isDeletingData}
                >
                  {isDeletingData ? <Spinner size="sm" /> : "Delete"}
                </Button>
              </ListItem>
            ))}
          </UnorderedList>
        ) : (
          <Text color="gray.500">No data available.</Text>
        )}
      </Box>
      <Box mt={6} display="flex" justifyContent="center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          mr={2}
        >
          Previous
        </Button>
        <Text as="span" fontWeight="semibold">
          {currentPage}
        </Text>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages || data.length < 5}
          ml={2}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
}

export default Main;