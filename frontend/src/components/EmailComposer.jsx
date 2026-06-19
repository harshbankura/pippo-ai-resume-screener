import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button, IconButton, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "rgba(255,255,255,0.98)",
  border: "2px solid #43cea2",
  boxShadow: 24,
  borderRadius: 4,
  p: 4,
};

export default function EmailComposer({ open, handleClose, candidate }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");

  const handleSend = async () => {
    setStatus("sending");
    try {
      // Replace with your backend or Web3Forms endpoint and key
      await axios.post("https://api.web3forms.com/submit", {
        access_key: "YOUR_WEB3FORMS_ACCESS_KEY",
        to: candidate.email,
        subject,
        body,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  };

  if (!candidate) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={modalStyle}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Send Email</Typography>
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </Box>
        <Typography mb={1}><b>To:</b> {candidate.email}</Typography>
        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Message"
          value={body}
          onChange={e => setBody(e.target.value)}
          multiline
          minRows={4}
          sx={{ mb: 2 }}
        />
        <Button 
          variant="contained" 
          endIcon={<SendIcon />}
          onClick={handleSend} 
          disabled={status === "sending"}
          sx={{ bgcolor: "#43cea2", color: "#fff", '&:hover': { bgcolor: "#34a97b" } }}
        >
          Send
        </Button>
        {status === "success" && <Alert severity="success" sx={{ mt: 2 }}>Email sent!</Alert>}
        {status === "error" && <Alert severity="error" sx={{ mt: 2 }}>Failed to send email.</Alert>}
      </Box>
    </Modal>
  );
}
