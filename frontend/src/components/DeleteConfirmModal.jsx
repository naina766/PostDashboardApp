import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FiAlertTriangle } from "react-icons/fi";

export default function DeleteConfirmModal({ show, onHide, onConfirm, deleting = false }) {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2 text-danger fs-5">
          <FiAlertTriangle /> Delete Post?
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-1 text-body">
          Are you sure you want to delete this post?
        </p>
        <p className="text-muted small mb-0">
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={deleting}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={deleting}>
          {deleting ? (
            <>
              <Spinner size="sm" animation="border" className="me-1" /> Deleting...
            </>
          ) : (
            "Delete"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
