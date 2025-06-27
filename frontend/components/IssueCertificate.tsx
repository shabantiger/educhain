import React, { useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { contractAddress, contractABI } from '../constants/contract';

const IssueCertificate = () => {
  // Form inputs
  const [studentAddress, setStudentAddress] = useState('');
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [grade, setGrade] = useState('');
  const [ipfsHash, setIpfsHash] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [certificateType, setCertificateType] = useState('');

  // Prepare contract write configuration
  const { config } = usePrepareContractWrite({
    address: contractAddress,
    abi: contractABI,
    functionName: 'issueCertificate',
    args: [
      studentAddress,
      studentName,
      courseName,
      grade,
      ipfsHash,
      Number(completionDate),
      certificateType,
    ],
  });

  // Execute the contract write
  const { write, isLoading, isSuccess, error } = useContractWrite(config);

  return (
    <div>
      <h2>Issue Certificate</h2>

      <input
        type="text"
        placeholder="Student Address"
        value={studentAddress}
        onChange={(e) => setStudentAddress(e.target.value)}
      />
      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Grade"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
      />
      <input
        type="text"
        placeholder="IPFS Hash"
        value={ipfsHash}
        onChange={(e) => setIpfsHash(e.target.value)}
      />
      <input
        type="date"
        placeholder="Completion Date"
        onChange={(e) => setCompletionDate(new Date(e.target.value).getTime().toString())}
      />
      <input
        type="text"
        placeholder="Certificate Type"
        value={certificateType}
        onChange={(e) => setCertificateType(e.target.value)}
      />

      <button onClick={() => write?.()} disabled={!write || isLoading}>
        {isLoading ? 'Issuing...' : 'Issue Certificate'}
      </button>

      {isSuccess && <p>✅ Certificate issued successfully!</p>}
      {error && <p style={{ color: 'red' }}>❌ Error: {error.message}</p>}
    </div>
  );
};

export default IssueCertificate;
