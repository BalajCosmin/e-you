package com.example.enviromentalapp.Services;

import com.example.enviromentalapp.response.ListResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class FileStorageService {
    private static final Logger logger = LoggerFactory.getLogger(FileStorageService.class);

    private final IncidentService incidentService;
    private Path fileStorageLocation;

    // You can configure this in application.properties
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Autowired
    public FileStorageService(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostConstruct
    public void init() {
        try {
            // Create the uploads directory if it doesn't exist
            this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.fileStorageLocation);
            logger.info("Initialized file storage in directory: {}", this.fileStorageLocation);
        } catch (Exception ex) {
            logger.error("Could not create upload directory: {}", uploadDir, ex);
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }

    public String getUploadDir() {
        return this.uploadDir;
    }

    public ListResponse storeFiles(List<MultipartFile> files, String incidentId) {
        List<String> storedFilePaths = new ArrayList<>();

        try {
            // Validate incidentId if required
            if (incidentId != null && !incidentId.isEmpty()) {
                boolean exists = false;
                try {
                    exists = incidentService.existsById(incidentId);
                } catch (Exception e) {
                    logger.error("Error checking if incident exists: {}", incidentId, e);
                    return new ListResponse("Error verifying incident: " + e.getMessage());
                }

                if (!exists) {
                    logger.error("Incident not found: {}", incidentId);
                    return new ListResponse("Incident not found: " + incidentId);
                }
            }

            // Process each file
            for (MultipartFile file : files) {
                if (file.isEmpty()) {
                    logger.warn("Skipping empty file upload");
                    continue;
                }

                // Create a unique filename
                String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
                String fileExtension = getFileExtension(originalFilename);
                String newFilename = UUID.randomUUID().toString() + fileExtension;

                // Define directory structure
                Path incidentDir;
                if (incidentId != null && !incidentId.isEmpty()) {
                    incidentDir = this.fileStorageLocation.resolve("incident_" + incidentId);
                } else {
                    incidentDir = this.fileStorageLocation.resolve("incident_unassigned");
                }

                // Create directories if needed
                if (!Files.exists(incidentDir)) {
                    logger.info("Creating directory for incident: {}", incidentDir);
                    Files.createDirectories(incidentDir);
                }

                // Copy file to target location
                Path targetLocation = incidentDir.resolve(newFilename);
                logger.info("Storing file {} to {}", originalFilename, targetLocation);

                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

                // Store relative path using correct structure for endpoint matching
                String relativePath = "incident_" + incidentId + "/" + newFilename;
                storedFilePaths.add(relativePath);

                logger.info("Successfully stored file: {} as {}", originalFilename, relativePath);
            }

            // Update the incident with the file paths if needed
            if (incidentId != null && !incidentId.isEmpty() && !storedFilePaths.isEmpty()) {
                logger.info("Updating incident {} with {} image paths", incidentId, storedFilePaths.size());
                incidentService.updateIncidentImages(incidentId, storedFilePaths);
            }

            return new ListResponse(storedFilePaths);

        } catch (IOException e) {
            logger.error("Failed to store files due to IO error", e);
            return new ListResponse("Error storing files: " + e.getMessage());
        } catch (ExecutionException | InterruptedException e) {
            logger.error("Failed to update incident with image paths", e);
            Thread.currentThread().interrupt();
            return new ListResponse("Error updating incident with images: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during file storage", e);
            return new ListResponse("Unexpected error: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || filename.lastIndexOf(".") == -1) {
            return ".jpg"; // Default extension
        }
        return filename.substring(filename.lastIndexOf(".")).toLowerCase();
    }
}