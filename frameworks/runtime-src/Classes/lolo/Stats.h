#ifndef __LOLO_STATS_H__
#define __LOLO_STATS_H__


#include <chrono>
#include <string>
#include "network/WebSocket.h"


/*是否启用帧耗时统计*/
#define LOLO_STATS_ENABLED 1


namespace lolo
{

	class WebSocketDelegate : public cocos2d::network::WebSocket::Delegate
	{

	public:
		WebSocketDelegate();
		~WebSocketDelegate();

		void send(std::string &msg);

	private:
		cocos2d::network::WebSocket* _ws;

		virtual void onOpen(cocos2d::network::WebSocket* ws);
		virtual void onMessage(cocos2d::network::WebSocket* ws, const cocos2d::network::WebSocket::Data& data);
		virtual void onClose(cocos2d::network::WebSocket* ws);
		virtual void onError(cocos2d::network::WebSocket* ws, const cocos2d::network::WebSocket::ErrorCode& error);

	};





	/*调用 startCodeTime() 时，返回的ID类型*/
	typedef unsigned int STATS_ID;


	/**
	 * 统计每帧时间耗费：代码耗时、渲染耗时、休眠时长。
	 * 以及每隔几帧统计一次CPU使用率
	 * 所用到的时间单位均为微秒
	 */
	class Stats
	{


	public:

		Stats();
		virtual ~Stats();


		/**
		 * 进入新的一帧（结束统计上一帧）
		 */
		static void enterFrame();



		/**
		 * 开始统计渲染耗时
		 */
		static void startRenderTime();

		/**
		 * 结束统计渲染耗时
		 */
		static void endRenderTime();

		/**
		 * 在统计渲染耗时的过程中，减去代码耗时
		 */
		static void lessRenderTime(std::chrono::microseconds time);



		/**
		 * 开始统计代码耗时
		 * @return 不重复的统计ID
		 */
		static STATS_ID startCodeTime();

		/**
		 * 结束统计代码耗时
		 * @param id 统计ID
		 * @return 从开始统计到结束统计所经过的时间
		 */
		static std::chrono::microseconds endCodeTime(STATS_ID id);



	private:

		/*自增的统计ID*/
		static STATS_ID _id;
		/*当前正在统计代码耗时的ID*/
		static STATS_ID _codeTimeID;

		/*帧开始的时间点*/
		static std::chrono::steady_clock::time_point _tpFrame;
		/*开始统计渲染耗时的时间点*/
		static std::chrono::steady_clock::time_point _tpRender;
		/*开始统计代码耗时的时间点*/
		static std::chrono::steady_clock::time_point _tpCode;

		/*渲染已耗时*/
		static std::chrono::microseconds _tRender;
		/*代码已耗时*/
		static std::chrono::microseconds _tCode;
		/*需要减去的渲染耗时*/
		static std::chrono::microseconds _tRenderLessTime;


		static WebSocketDelegate* _wsd;
	};

}


#endif // __LOLO_STATS_H__