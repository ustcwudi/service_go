package storage

import (
	"context"
	"lib/config"
	"lib/log"
	"mime/multipart"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// Client Minio Client
var Client *minio.Client

func init() {
	var err error
	Client, err = minio.New(config.Service.Minio.Endpoint, &minio.Options{Creds: credentials.NewStaticV4(config.Service.Minio.Key, config.Service.Minio.Secret, ""), Secure: false})
	if err != nil {
		log.Error(err)
	}
}

// CreateBucket 创建存储区
func CreateBucket(bucket string) {
	ctx := context.Background()
	exist, err := Client.BucketExists(ctx, bucket)
	if err == nil && !exist {
		log.Info("create bucket " + bucket)
		Client.MakeBucket(ctx, bucket, minio.MakeBucketOptions{Region: "us-east-1"})
	}
}

// Upload 上传文件
func Upload(bucket string, objectName string, file *multipart.FileHeader) error {
	src, err := file.Open()
	if err != nil {
		log.Error(err)
	}
	defer src.Close()

	_, err = Client.PutObject(context.Background(), bucket, objectName, src, -1, minio.PutObjectOptions{})
	if err != nil {
		log.Error(err)
	}
	return err
}

// Download 下载文件
func Download(bucket string, objectName string) (*minio.Object, error) {
	object, err := Client.GetObject(context.Background(), bucket, objectName, minio.GetObjectOptions{})
	if err != nil {
		log.Error(err)
	}
	return object, err
}

// Remove 删除文件
func Remove(bucket string, objectName string) error {
	err := Client.RemoveObject(context.Background(), bucket, objectName, minio.RemoveObjectOptions{})
	if err != nil {
		log.Error(err)
	}
	return err
}
