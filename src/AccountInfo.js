import './AccountInfo.css';
import moment from 'moment';
import 'moment/locale/ko';
import { useState } from 'react';

function AccountInfo() {
    const [account, setAccount] = useState('');
    const [currentOccupier, setCurrentOccupier] = useState('');
    const [newOccupier, setNewOccupier] = useState('');
    const [endTime, setEndTime] = useState('');

    var now = moment().format('HH:mm');
    const [requestEndTime, setRequestEndTime] = useState(now);
    const [isOccupiedMsgVisible, setIsOccupiedMsgVisible] = useState('');
    const [isReleaseMsgVisible, setIsReleaseMsgVisible] = useState('');
    const [isErrorMsgVisible, setIsErrorMsgVisible] = useState('');

    const DEFAULT_ERROR = "현재 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.";
    const EMPTY_STRING_ERROR = "사용자 이름을 입력해주세요.";

    const [errorMsg, setErrorMsg] = useState(DEFAULT_ERROR);

    fetch('https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing/')
        .then(response => response.json())
        .then(result => {
            setAccount(result.account);
            setCurrentOccupier(result.occupier);
            setEndTime(result.endtime);
        })
        .catch(error => setIsErrorMsgVisible(true));

    function onNameChange(event) {
        setNewOccupier(event.target.value);
    }

    function onRequestEndTimeChange(event) {
        setRequestEndTime(event.target.value);
    }

    function onAddHalfHour(event) {
        event.preventDefault();
        setRequestEndTime(moment(requestEndTime, 'HH:mm').add(30, 'minutes').format('HH:mm'));
    }

    function onAddHour(event) {
        event.preventDefault();
        setRequestEndTime(moment(requestEndTime, 'HH:mm').add(1, 'hours').format('HH:mm'));
    }

    function onSubmitOccupation(event) {
        event.preventDefault();

        if (newOccupier == "") {
                setErrorMsg(EMPTY_STRING_ERROR);
                setIsReleaseMsgVisible(false);
                setIsOccupiedMsgVisible(false);
                setIsErrorMsgVisible(true);
            return;
        }

        fetch(
            'https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset="utf-8"' },
            body: JSON.stringify(
                {
                    occupier: newOccupier,
                    endtime: requestEndTime
                }),
        }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    throw new Error(response.error);
                }
            }
            )
            .then(result => {
                // update time labels
                setEndTime(result.endtime);
                setRequestEndTime(moment().format('HH:mm'));

                // update occupier labels
                setAccount(result.account);
                setCurrentOccupier(result.occupier);
                setNewOccupier("");

                // set message visible/invisible
                setIsReleaseMsgVisible(false);
                setIsOccupiedMsgVisible(true);
                setIsErrorMsgVisible(false);
            })
            .catch(error => {
                setErrorMsg(error.message);
                setIsReleaseMsgVisible(false);
                setIsOccupiedMsgVisible(false);
                setIsErrorMsgVisible(true);
            });
    }

    function onSubmitRelease(event) {
        event.preventDefault();

        fetch(
            'https://1zwse7h675.execute-api.ap-northeast-2.amazonaws.com/default/accountsharing/release', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset="utf-8"' },
            body: "",
        }
        )
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                else {
                    throw new Error(response.error);
                }
            })
            .then(result => {
                setAccount(result.account);
                setCurrentOccupier(result.occupier);
                setEndTime(result.endtime);
                setNewOccupier("");
                //setRequestEndTime();
                setIsReleaseMsgVisible(true);
                setIsOccupiedMsgVisible(false);
                setIsErrorMsgVisible(false);
            })
            .catch(error => {
                setErrorMsg(error);
                setIsReleaseMsgVisible(false);
                setIsOccupiedMsgVisible(false);
                setIsErrorMsgVisible(true);
            });
    }

    return (
        <div>
            <header id="header">
                <h1 id="account">{account}</h1>
            </header>

            {
                currentOccupier === "" ?
                    <p id="current-status">아직 아무도 계정에 접속하지 않았습니다.<br />&nbsp;</p>
                    : <p id="current-status">현재 <strong>{currentOccupier}</strong> 님이 접속 중입니다.
                        <br />접속 종료 예정: <strong>{endTime}</strong></p>
            }

            <form>
                <input type="text" id="namer" required pattern="[a-zA-Z0-9\s]+" value={newOccupier} placeholder="새 사용자 이름" onChange={onNameChange} />
                <input type="time" id="time" value={requestEndTime} onChange={onRequestEndTimeChange} />
                <div className="message visible">까지 예약하겠습니까?</div>
            </form>

            <form id="signup-form">
                <button type="button" onClick={onAddHalfHour} >+30분</button>
                <button type="button" onClick={onAddHour} >+1시간</button>
                <button className="blue" type="button" id="useBtn" onClick={onSubmitOccupation} >예약</button>
                <button className="red" type="button" id="releaseBtn" onClick={onSubmitRelease} >사용 완료</button>
            </form>

            <form>
                {
                    isOccupiedMsgVisible ? <div className="message success visible">{endTime} 까지 성공적으로 예약되었습니다.</div> : ""
                }
                {
                    isReleaseMsgVisible ? <div className="message success visible">접속을 종료했습니다.</div> : ""
                }
                {
                    isErrorMsgVisible ? <div className="message failure visible">{errorMsg}</div> : ""
                }

                <div className="message">""</div>

            </form>

        </div>
    );
}



export default AccountInfo;