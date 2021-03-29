package storage

import (
	"mime/multipart"
	"lib/config"
	"lib/log"

	"github.com/minio/minio-go"
)

// Client Minio Client
var Client *minio.Client

func init() {
	Client, _ = minio.New(config.Service.Minio.Endpoint, config.Service.Minio.Key, config.Service.Minio.Secret, false)
}

// CreateBucket 创建存储区
func CreateBucket(bucket string) {
	exist, _ := Client.BucketExists(bucket)
	if !exist {
		log.Info("create bucket " + bucket)
		Client.MakeBucket(bucket, "")
	}
}

// Upload 上传文件
func Upload(bucket string, objectName string, file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		log.Error(err)
	}
	defer src.Close()

	_, err = Client.PutObject(bucket, objectName, src, -1, minio.PutObjectOptions{})
	if err != nil {
		log.Error(err)
	}
	return err
}

// Download 下载文件
func Download(bucket string, objectName string) (*minio.Object, error) {
	object, err := Client.GetObject(bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		log.Error(err)
	}
	return object, err
}

// Remove 删除文件
func Remove(bucket string, objectName string) error {
	err := Client.RemoveObject(bucket, objectName)
	if err != nil {
		log.Error(err)
	}
	return err
}
