package com.example.enviromentalapp.Controller;

import com.example.enviromentalapp.Services.ImageUploadService;
import com.example.enviromentalapp.Services.IncidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
@RequestMapping("/images")
public class ImageController {

    @Autowired
    private ImageUploadService imageUploadService;

    @Autowired
    private IncidentService incidentService;

    @PostMapping("/incidents/pics")
    public ResponseEntity<?> uploadIncidentImages(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("incidentId") String incidentId) {

        try {
            System.out.println("Received upload request for incident: " + incidentId);
            System.out.println("Number of files: " + files.length);

            List<String> uploadedImageUrls = new ArrayList<>();

            for (MultipartFile file : files) {
                System.out.println("Uploading file: " + file.getOriginalFilename());
                System.out.println("File size: " + file.getSize());
                String imageUrl = imageUploadService.uploadImage(file, incidentId);
                uploadedImageUrls.add(imageUrl);
            }

            incidentService.updateIncidentImages(incidentId, uploadedImageUrls);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Images uploaded successfully");
            response.put("imageUrls", uploadedImageUrls);
            response.put("count", uploadedImageUrls.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload images");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @PostMapping("/profile/upload")
    public ResponseEntity<?> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            System.out.println("Received profile picture upload: " + file.getOriginalFilename());
            System.out.println("File size: " + file.getSize());

            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            // Check file type
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new IllegalArgumentException("File must be an image");
            }

            if (file.getSize() > 2 * 1024 * 1024) {
                throw new IllegalArgumentException("Profile picture must be less than 2MB");
            }

            String filename = imageUploadService.uploadProfilePicture(file);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile picture uploaded successfully");
            response.put("filename", filename);
            response.put("path", filename); // For backward compatibility
            response.put("imageUrl", filename);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload profile picture");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Resource resource = imageUploadService.loadImage(filename);

            if (resource.exists() && resource.isReadable()) {
                // Determine content type
                String contentType = "image/jpeg"; // Default
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}