package com.example.enviromentalapp.Controller;

import com.example.enviromentalapp.response.ListResponse;
import com.example.enviromentalapp.Services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
public class ImageController {

    private final FileStorageService fileStorageService;

    @Autowired
    public ImageController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/images/incidents/pics")
    public ResponseEntity<ListResponse> uploadIncidentImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "incidentId", required = false) String incidentId) {

        ListResponse response = fileStorageService.storeFiles(files, incidentId);

        if (response.getData() != null) {
            return ResponseEntity.ok(response);
        } else {
            // Something went wrong
            return ResponseEntity.badRequest().body(response);
        }
    }

    // Updated to handle nested paths properly
    @GetMapping("/images/{filePath:.+}/**")
    public ResponseEntity<Resource> serveFile(@PathVariable String filePath, HttpServletRequest request) {
        try {
            // Get the complete path from the request
            String completePath = request.getRequestURI().substring("/images/".length());

            Path path = Paths.get(fileStorageService.getUploadDir()).resolve(completePath);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = getContentType(path.toString());

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private String getContentType(String filePath) {
        String extension = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();
        return switch (extension) {
            case ".jpg", ".jpeg" -> "image/jpeg";
            case ".png" -> "image/png";
            case ".gif" -> "image/gif";
            default -> "application/octet-stream";
        };
    }
}