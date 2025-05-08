package com.example.enviromentalapp.Services;

import com.example.enviromentalapp.Services.IncidentService;
import com.example.enviromentalapp.response.ListResponse;
import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

@Service
public class FirebaseFileService {
    private static final Logger logger = LoggerFactory.getLogger(FirebaseFileService.class);

    private final IncidentService incidentService;

    @Autowired
    public FirebaseFileService(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    private static final String BUCKET_NAME = "enviromental-app.appspot.com";
    private static final String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/" + BUCKET_NAME + "/o/%s?alt=media";
    private static final String SERVICE_ACCOUNT_PATH = "src/main/resources/serviceAccountKey.json";

    /**
     * Uploads a file to Firebase Storage
     * @param file The file to upload
     * @param fileName The name to give the file in Firebase Storage
     * @return The public URL for the uploaded file
     */
    private String uploadFile(File file, String fileName) throws IOException {
        logger.info("Uploading file: {}", fileName);

        BlobId blobId = BlobId.of(BUCKET_NAME, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("media")
                .build();

        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(SERVICE_ACCOUNT_PATH));
        Storage storage = StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();

        storage.create(blobInfo, Files.readAllBytes(file.toPath()));
        String fileUrl = String.format(DOWNLOAD_URL, URLEncoder.encode(fileName, StandardCharsets.UTF_8));

        logger.info("File uploaded successfully: {}", fileUrl);
        return fileUrl;
    }

    /**
     * Converts MultipartFile to File
     * @param multipartFile The MultipartFile to convert
     * @param fileName The name to give the converted file
     * @return The converted File
     */
    private File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
        }
        return tempFile;
    }

    /**
     * Uploads a single file (typically for profile pictures)
     * @param multipartFile The file to upload
     * @return A ListResponse containing the URL of the uploaded file
     */
    public ListResponse upload(MultipartFile multipartFile) {
        try {
            String originalFileName = multipartFile.getOriginalFilename();
            if (originalFileName == null || originalFileName.isEmpty()) {
                return new ListResponse("Error: File name is empty");
            }

            String fileName = UUID.randomUUID().toString().concat(getExtension(originalFileName));

            File file = convertToFile(multipartFile, fileName);
            String fileUrl = uploadFile(file, fileName);
            file.delete(); // Clean up temporary file

            return new ListResponse(List.of(fileUrl));
        } catch (Exception e) {
            logger.error("Error uploading file", e);
            return new ListResponse("Error uploading file: " + e.getMessage());
        }
    }

    /**
     * Uploads multiple files (typically for incident images)
     * Overloaded method to maintain compatibility
     */
    public ListResponse uploadMultipleFiles(List<MultipartFile> multipartFileList) {
        return uploadMultipleFiles(multipartFileList, null);
    }

    /**
     * Uploads multiple files and associates them with an incident
     * @param multipartFileList List of files to upload
     * @param incidentId The ID of the incident to associate the files with
     * @return A ListResponse containing the URLs of the uploaded files
     */
    public ListResponse uploadMultipleFiles(List<MultipartFile> multipartFileList, String incidentId) {
        logger.info("Starting upload of {} files for incident ID: {}",
                multipartFileList.size(), incidentId != null ? incidentId : "none");

        List<String> uploadedUrls = new ArrayList<>();

        try {
            // Process each file
            for (MultipartFile multipartFile : multipartFileList) {
                String originalFileName = multipartFile.getOriginalFilename();
                if (originalFileName == null || originalFileName.isEmpty()) {
                    logger.warn("Skipping file with empty name");
                    continue;
                }

                // Generate a unique filename for Firebase Storage
                String storageFileName = UUID.randomUUID().toString().concat(getExtension(originalFileName));

                // Convert and upload
                File file = convertToFile(multipartFile, storageFileName);
                String imageUrl = uploadFile(file, storageFileName);
                uploadedUrls.add(imageUrl);

                // Clean up temp file
                file.delete();
            }

            logger.info("Successfully uploaded {} files", uploadedUrls.size());

            // Update the incident with image URLs if needed
            if (incidentId != null && !incidentId.isEmpty() && !uploadedUrls.isEmpty()) {
                try {
                    String result = incidentService.updateIncidentImages(incidentId, uploadedUrls);
                    logger.info("Updated incident {} with image URLs: {}", incidentId, result);
                } catch (ExecutionException | InterruptedException e) {
                    logger.error("Error updating incident with image URLs", e);
                    // We don't fail the whole operation - at least the images were uploaded
                }
            }

            return new ListResponse(uploadedUrls);
        } catch (Exception e) {
            logger.error("Error in uploadMultipleFiles", e);
            return new ListResponse("Error uploading files: " + e.getMessage());
        }
    }

    /**
     * Downloads a file from Firebase Storage
     * @param fileName The name of the file to download
     * @return Success message or error
     */
    public Object download(String fileName) throws IOException {
        try {
            String destFileName = UUID.randomUUID().toString().concat(getExtension(fileName));
            String destFilePath = System.getProperty("java.io.tmpdir") + File.separator + destFileName;

            Credentials credentials = GoogleCredentials.fromStream(new FileInputStream(SERVICE_ACCOUNT_PATH));
            Storage storage = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .build()
                    .getService();

            Blob blob = storage.get(BlobId.of(BUCKET_NAME, fileName));
            if (blob == null) {
                return "Error: File not found";
            }

            blob.downloadTo(Paths.get(destFilePath));
            return "Successfully Downloaded to: " + destFilePath;
        } catch (Exception e) {
            logger.error("Error downloading file", e);
            return "Error downloading file: " + e.getMessage();
        }
    }

    /**
     * Gets the file extension from a filename
     * @param fileName The filename to extract extension from
     * @return The extension including the dot
     */
    private String getExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex < 0) {
            return ".bin"; // Default extension if none found
        }
        return fileName.substring(lastDotIndex);
    }
}