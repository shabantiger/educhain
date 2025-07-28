
import React, { useState } from 'react';
import { useWriteContract } from 'wagmi';
// Update the import path below to the correct relative path for your project
// Update the import path below to the correct relative path for your project
// If you get a module not found error, update the path below to the correct location, e.g.:
// import { CONTRACT_ADDRESS, ABI } from '../../constants/contract';
// Or create the file at ../constants/contract.ts with the following content:
// export const CONTRACT_ADDRESS = '0xYourContractAddress';
// export const ABI = [ /* your contract ABI here */ ];
import axios from 'axios';
import { CONTRACT_ADDRESS, ABI } from '../src/constants/contract';

const IssueCertificate = () => {
  // Form inputs

  const [studentAddress, setStudentAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [certificateFile, setCertificateFile] = useState<null | File>(null);
  // const [ipfsHash, setIpfsHash] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [backendError, setBackendError] = useState('');

  // Execute the contract write
  const {
    writeContract,
    isPending,
    isSuccess,
    error,
  } = useWriteContract();


  const handleIssueCertificate = async () => {
    setBackendError('');
    // Basic validation
    if (!studentAddress || !studentName || !courseName || !certificateFile) {
      setBackendError('Please fill all required fields and upload a certificate file.');
      return;
    }
    try {
      // Prepare form data for backend
      const formData = new FormData();
      formData.append('studentAddress', studentAddress);
      formData.append('studentName', studentName);
      formData.append('courseName', courseName);
      formData.append('grade', grade);
      formData.append('completionDate', completionDate);
      formData.append('certificateType', certificateType);
      formData.append('certificateFile', certificateFile);

      // Call backend to upload file and get IPFS hash
      const res = await axios.post('/api/certificates/issue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const { certificate } = res.data;

      // Now mint on-chain using contract
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'issueCertificate',
        args: [
          studentAddress,
          studentName,
          courseName,
          grade,
          certificate.ipfsHash,
          Number(completionDate),
          certificateType,
        ],
      });
    } catch (err) {
      setBackendError(err?.response?.data?.error || err.message || 'Backend error');
    }
  };

  return (
    <div>
      <h2>Issue Certificate</h2>

      <input
        type="text"
        placeholder="Student Address"
        value={studentAddress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCourseName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Grade"
        value={grade}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrade(e.target.value)}
      />
      <input
        type="file"
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          if (e.target.files && e.target.files[0]) {
            setCertificateFile(e.target.files[0]);
          }
        }}
      />
      <input
        type="date"
        placeholder="Completion Date"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setCompletionDate(String(new Date(e.target.value).getTime()))
        }
      />
      <input
        type="text"
        placeholder="Certificate Type"
        value={certificateType}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCertificateType(e.target.value)}
      />

      <button onClick={handleIssueCertificate} disabled={isPending}>
        {isPending ? 'Issuing...' : 'Issue Certificate'}
      </button>

      {isSuccess && <p>✅ Certificate issued successfully!</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error?.message}</p>}
      {backendError && <p style={{ color: 'red' }}>❌ Backend Error: {backendError}</p>}
    </div>
  );
};

export default IssueCertificate;
