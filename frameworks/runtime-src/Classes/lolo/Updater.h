#ifndef __LOLO_UPDATER_H__
#define __LOLO_UPDATER_H__


#include <string>


namespace lolo
{


	/**
	 * 更新状态
	 */
	enum class State
	{
		NOT_STARTED,    /* 未开始 */
		COMPLETE,       /* 更新完成 */
		DOWNLOAD,       /* 正在下载zip包 */
		UNZIP,          /* 正在解压zip包 */
		FAIL_DOWNLOAD,  /* 更新失败 - 下载失败 */
		FAIL_MD5,       /* 更新失败 - MD5不一致 */
		FAIL_UNZIP,     /* 更新失败 - 解压缩出错 */
	};


	/**
	 * 热更新相关
	 */
	class Updater
	{


	public:

		Updater();
		virtual ~Updater();



		/**
		 * 将 writablePath/assets 目录设置为优先搜索路径
		 */
		static void enableAssetsDir();

		/**
		 * 开始更新
		 */
		static void start(std::string url, std::string version, std::string md5);

		/**
		* 清空 patch 和 assets 文件夹
		*/
		static void clearUpdateDirectory();

		/**
		 * 重置（重启）APP
		 */
		static void resetApp();


		/**
		 * 获取当前状态
		 */
		static State getState();

		/**
		 * 获取已下载字节
		 */
		static double getByteLoaded();

		/**
		 * 获取总字节
		 */
		static double getByteTotal();

		/**
		 * 获取下载速度（byte/s）
		 */
		static long getSpeed();


	private:

		/*压缩包地址*/
		static std::string _url;
		/*压缩包MD5码*/
		static std::string _md5;
		/*当前版本号*/
		static std::string _version;

		/*当前更新状态*/
		static State _state;

		/*断点续载前，已下载字节*/
		static long _byteLoadedBefore;
		/*已下载字节*/
		static double _byteLoaded;
		/*总字节*/
		static double _byteTotal;
		/*下载速度（字节/每秒）*/
		static double _speed;

		/*压缩包文件指针*/
		static FILE *_file;



		/**
		 * 线程函数，下载更新包
		 */
		static void download();

		/*
		 * 下载进度更新
		 */
		static void progressHandler(void *clientp, double dltotal, double dlnow, double ultotal, double ulnow);

		/**
		 * 写入文件
		 */
		static size_t writeHandler(void *ptr, size_t size, size_t nmemb, FILE *stream);

		/**
		 * 解压刚下载好的补丁包
		 */
		static void unpatch();

		/**
		 * 解压zip文件
		 */
		static bool unzip(std::string filename, std::string destPath);
	};


}


#endif // __LOLO_UPDATER_H__