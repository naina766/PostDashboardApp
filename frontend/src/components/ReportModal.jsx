import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { submitReport } from "../services/reports";
import { useToast } from "../context/ToastContext";

export default function ReportModal({ show, onHide, targetType = "POST", targetId }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("SPAM");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!targetId) return;

    setLoading(true);
    try {
      await submitReport({
        targetType,
        targetId,
        reason,
        details,
      });
      showToast("Thank you for helping keep our community safe. Your report has been submitted.", "success");
      onHide();
      setDetails("");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to submit report.", "danger");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h6 fw-bold">Report Content</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Please tell us why you are reporting this {targetType.toLowerCase()}. Our moderation team reviews all reports.
          </p>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Reason</Form.Label>
            <Form.Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option value="SPAM">Spam or scam</option>
              <option value="HARASSMENT">Harassment or bullying</option>
              <option value="HATE">Hate speech or discrimination</option>
              <option value="VIOLENCE">Violence or dangerous content</option>
              <option value="SEXUAL">Inappropriate or adult content</option>
              <option value="MISLEADING">Misleading information</option>
              <option value="OTHER">Other violation</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label className="small fw-semibold">Additional details (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Provide more context..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={500}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" animation="border" /> : "Submit Report"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
