/****************************************************************************
 
 ****************************************************************************/


#include "Stats.h"
#include "cocos2d.h"


using namespace std::chrono;


namespace lolo
{

	cocos2d::network::WebSocket* _ws = nullptr;


	WebSocketDelegate::WebSocketDelegate()
	{
		_ws = new cocos2d::network::WebSocket();
		_ws->init(*this, "ws://10.8.10.71:7109");
	}

	WebSocketDelegate::~WebSocketDelegate()
	{
	}


	void WebSocketDelegate::send(std::string &msg)
	{
		_ws->send(msg);
	}


	void WebSocketDelegate::onOpen(cocos2d::network::WebSocket* ws)
	{
	}

	void WebSocketDelegate::onMessage(cocos2d::network::WebSocket* ws, const cocos2d::network::WebSocket::Data& data)
	{
	}

	void WebSocketDelegate::onClose(cocos2d::network::WebSocket* ws)
	{
	}

	void WebSocketDelegate::onError(cocos2d::network::WebSocket* ws, const cocos2d::network::WebSocket::ErrorCode& error)
	{
	}


	//


	//



	STATS_ID Stats::_id = 0;
	STATS_ID Stats::_codeTimeID = 0;

	steady_clock::time_point Stats::_tpFrame = steady_clock::now();
	steady_clock::time_point Stats::_tpRender = _tpFrame;
	steady_clock::time_point Stats::_tpCode = _tpFrame;

	microseconds Stats::_tRender = microseconds(0);
	microseconds Stats::_tCode = microseconds(0);
	microseconds Stats::_tRenderLessTime = microseconds(0);

	WebSocketDelegate* Stats::_wsd = new WebSocketDelegate();


	Stats::Stats()
	{
	}

	Stats::~Stats()
	{
	}


	void Stats::enterFrame()
	{
		steady_clock::time_point now = steady_clock::now();

		float frameTime = duration_cast<microseconds>(now - _tpFrame).count() / 1000.0f;
		float codeTime = _tCode.count() / 1000.0f;
		float renderTime = (_tRender - _tRenderLessTime).count() / 1000.0f;
		float idleTime = frameTime - codeTime - renderTime;

		char c[50];
		sprintf(c, "[LOLO Stats Begin]%f,%f,%f", codeTime, renderTime, idleTime);
		std::string s = c;
		_wsd->send(s);
		// cocos2d::CCLog("[LOLO Stats Begin]%f,%f,%f", codeTime, renderTime, idleTime);

		_codeTimeID = 0;
		_tCode = microseconds(0);
		_tRenderLessTime = microseconds(0);
		_tpFrame = now;
	}



	void Stats::startRenderTime()
	{
		_tpRender = steady_clock::now();
	}

	void Stats::endRenderTime()
	{
		_tRender = duration_cast<microseconds>(steady_clock::now() - _tpRender);
	}

	void Stats::lessRenderTime(microseconds time)
	{
		_tRenderLessTime += time;
	}



	STATS_ID Stats::startCodeTime()
	{
		// 正在统计代码耗时
		if (_codeTimeID != 0) return 0;

		_tpCode = steady_clock::now();
		_codeTimeID = ++_id;
		return _codeTimeID;
	}

	microseconds Stats::endCodeTime(STATS_ID id)
	{
		// 不是当前正在统计的ID
		if (id != _codeTimeID) return microseconds(0);

		microseconds time = duration_cast<microseconds>(steady_clock::now() - _tpCode);
		_tCode += time;
		_codeTimeID = 0;

		return time;
	}


	//
}