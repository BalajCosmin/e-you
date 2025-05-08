package com.example.enviromentalapp.controller;

import com.example.enviromentalapp.response.ListResponse;
import com.example.enviromentalapp.services.FirebaseFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5500")
public class ImageController {


    @Autowired
    private FirebaseFileService firebaseFileService;

    //https://medium.com/teamarimac/file-upload-and-download-with-spring-boot-firebase-af068bc62614
    @PostMapping("/iamges/profile/pic")
    public ListResponse upload(@RequestParam("file") MultipartFile multipartFile) {
        //  logger.info("HIT -/upload | File Name : {}", multipartFile.getOriginalFilename());
        return firebaseFileService.upload(multipartFile);
    }

    @PostMapping("/images/incidents/pics")
    public ListResponse uploadIncidentsImageList(@RequestParam("files") List<MultipartFile> multipartFileList) {
        //  logger.info("HIT -/upload | File Name : {}", multipartFile.getOriginalFilename());
        return firebaseFileService.uploadMultipleFiles(multipartFileList);
    }

    @PostMapping("/profile/pic/{fileName}")
    public Object download(@PathVariable String fileName) throws IOException {
        //logger.info("HIT -/download | File Name : {}", fileName);
        return firebaseFileService.download(fileName);
    }

}