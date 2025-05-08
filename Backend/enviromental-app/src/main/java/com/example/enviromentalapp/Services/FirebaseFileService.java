package com.example.enviromentalapp.services;

import com.example.enviromentalapp.response.ListResponse;
import com.example.enviromentalapp.response.LoginResponse;
import com.google.auth.Credentials;
import com.google.auth.oauth2.GoogleCredentials;

import com.google.cloud.storage.*;
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

@Service
public class FirebaseFileService {

    private static String TEMP_URL = "";
    private static final String DOWNLOAD_URL = "https://firebasestorage.googleapis.com/v0/b/enviromental-app.appspot.com/o/%s?alt=media";

    private String uploadFile(File file, String fileName) throws IOException {
        BlobId blobId = BlobId.of("enviromental-app.appspot.com", fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId).setContentType("media").build();
        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream("src/main/resources/serviceAccountKey.json"));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        storage.create(blobInfo, Files.readAllBytes(file.toPath()));
        return String.format(DOWNLOAD_URL, URLEncoder.encode(fileName, StandardCharsets.UTF_8));
    }

    private File convertToFile(MultipartFile multipartFile, String fileName) throws IOException {
        File tempFile = new File(fileName);
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(multipartFile.getBytes());
            fos.close();
        }
        return tempFile;
    }

    public ListResponse upload(MultipartFile multipartFile) {

        try {
            String fileName = multipartFile.getOriginalFilename();                        // to get original file name
            fileName = UUID.randomUUID().toString().concat(this.getExtension(fileName));  // to generated random string values for file name.

            File file = this.convertToFile(multipartFile, fileName);                      // to convert multipartFile to File
            TEMP_URL = this.uploadFile(file, fileName);                                   // to get uploaded file link
            file.delete();                                                                // to delete the copy of uploaded file stored in the project folder
            return new ListResponse(List.of(TEMP_URL));
        } catch (Exception e) {
            e.printStackTrace();
            return new ListResponse("Error, unsuccessfully uploaded!");
        }

    }

    public ListResponse uploadMultipleFiles(List<MultipartFile> multipartFileList) {
        List<String> fileNameList = new ArrayList<>();
        List<File> fileList = new ArrayList<>();
        List<String> tempUrlList = new ArrayList<>();
        try {

            for (MultipartFile multipartFile : multipartFileList
            ) {
                fileNameList.add(multipartFile.getOriginalFilename());

            }
        int i =0;
            for (String fileNameListItem : fileNameList
            ) {
                fileNameListItem = UUID.randomUUID().toString().concat(this.getExtension(fileNameListItem));

                File file = this.convertToFile(multipartFileList.get(i), fileNameListItem);
                fileList.add(this.convertToFile(multipartFileList.get(i), fileNameListItem));
                tempUrlList.add(this.uploadFile(file, fileNameListItem));
                file.delete();
                i++;
            }
            return new ListResponse(tempUrlList);
        } catch (Exception e) {
            e.printStackTrace();
            return new ListResponse("Error, unsuccessfully uploaded!");
        }

    }


    public Object download(String fileName) throws IOException {
        String destFileName = UUID.randomUUID().toString().concat(this.getExtension(fileName));     // to set random string for destination file name
        String destFilePath = "C:\\Users\\Cosmin\\Downloads\\New folder" + destFileName;                                    // to set destination file path

        Credentials credentials = GoogleCredentials.fromStream(new FileInputStream("src/main/resources/serviceAccountKey.json"));
        Storage storage = StorageOptions.newBuilder().setCredentials(credentials).build().getService();
        Blob blob = storage.get(BlobId.of("enviromental-app.appspot.com", fileName));
        blob.downloadTo(Paths.get(destFilePath));
        return "Successfully Downloaded!";
    }


    private String getExtension(String fileName) {
        return fileName.substring(fileName.lastIndexOf("."));
    }
}